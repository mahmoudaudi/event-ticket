import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined in .env.local");

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Cached on `globalThis`, not a plain module-level variable. This matters
// specifically in Next.js dev mode: Turbopack/webpack hot-reloads route
// modules as you navigate to newly-compiled routes, which re-evaluates this
// file's top-level scope. A plain `const cached = {...}` would get reset on
// every such reload, silently opening a brand new MongoDB connection each
// time instead of reusing the existing one — producing exactly the kind of
// slow, intermittent behavior (long delays, connections racing each other)
// that's otherwise very hard to attribute back to this file.
const globalForMongoose = globalThis as unknown as { mongooseCache?: MongooseCache };
const cached: MongooseCache = globalForMongoose.mongooseCache ?? { conn: null, promise: null };
globalForMongoose.mongooseCache = cached;

/** Reuses a single pooled Mongoose connection across hot reloads and serverless invocations. */
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        // Fail fast and loudly instead of hanging for the Mongoose default
        // (30s) when the cluster is briefly unreachable — a slow-but-silent
        // connection attempt looks identical to "no matching document" from
        // the outside otherwise.
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => {
        cached.conn = m;
        return m;
      })
      .catch((error) => {
        // Let the next call retry instead of permanently caching a failure.
        cached.promise = null;
        throw error;
      });
  }
  return cached.promise;
}

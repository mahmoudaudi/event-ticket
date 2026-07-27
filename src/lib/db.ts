import mongoose from "mongoose";
import dns from "dns";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined in .env.local");

function srv(host: string) {
  return new Promise<dns.SrvRecord[]>((resolve, reject) =>
    dns.resolveSrv(host, (err, records) => (err ? reject(err) : resolve(records)))
  );
}

function txt(host: string) {
  return new Promise<string[][]>((resolve, reject) =>
    dns.resolveTxt(host, (err, records) => (err ? reject(err) : resolve(records)))
  );
}

/** Resolves a mongodb+srv:// URI to a plain mongodb:// URI, for environments where SRV lookups fail. */
async function resolveSrvUri(uri: string): Promise<string> {
  const m = uri.match(/^mongodb\+srv:\/\/(.+?)@(.+?)\/(.+)$/);
  if (!m) return uri;
  try {
    const [srvRecords, txtRecords] = await Promise.all([
      srv(`_mongodb._tcp.${m[2]}`),
      txt(m[2]),
    ]);
    const hosts = srvRecords.map((r) => `${r.name}:${r.port}`);
    const params = txtRecords.flat().join("&");
    const db = m[3].includes("?") ? m[3] : `${m[3]}?ssl=true&retryWrites=true&w=majority&${params}`;
    return `mongodb://${m[1]}@${hosts.join(",")}/${db}`;
  } catch {
    return uri;
  }
}

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
    cached.promise = resolveSrvUri(MONGODB_URI)
      .then((uri) =>
        mongoose.connect(uri, {
          // Fail fast and loudly instead of hanging for the Mongoose default
          // (30s) when the cluster is briefly unreachable — a slow-but-silent
          // connection attempt looks identical to "no matching document" from
          // the outside otherwise.
          serverSelectionTimeoutMS: 10000,
        })
      )
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

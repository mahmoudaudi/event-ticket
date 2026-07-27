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

// Reuses a single pooled connection across Next.js hot reloads and serverless
// invocations by caching it on `globalThis` (module-level state is reset on HMR).
const globalForMongoose = globalThis as unknown as { mongooseCache?: MongooseCache };
const cached: MongooseCache = globalForMongoose.mongooseCache ?? { conn: null, promise: null };
globalForMongoose.mongooseCache = cached;

/** Reuses a single pooled Mongoose connection across hot reloads and serverless invocations. */
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = resolveSrvUri(MONGODB_URI)
      .then((uri) => mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 }))
      .then((m) => {
        cached.conn = m;
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }
  return cached.promise;
}

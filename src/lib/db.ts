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

let connPromise: Promise<typeof mongoose> | null = null;

export async function connectDB() {
  if (connPromise) return connPromise;

  const m = MONGODB_URI.match(/^mongodb\+srv:\/\/(.+?)@(.+?)\/(.+)$/);

  connPromise = (async () => {
    let uri = MONGODB_URI;
    if (m) {
      try {
        const [srvRecords, txtRecords] = await Promise.all([
          srv(`_mongodb._tcp.${m[2]}`),
          txt(m[2]),
        ]);
        const hosts = srvRecords.map((r) => `${r.name}:${r.port}`);
        const params = txtRecords.flat().join("&");
        const db = m[3].includes("?") ? m[3] : `${m[3]}?ssl=true&retryWrites=true&w=majority&${params}`;
        uri = `mongodb://${m[1]}@${hosts.join(",")}/${db}`;
      } catch {
        // fallback to original mongodb+srv:// URI
      }
    }
    return mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  })();

  connPromise = connPromise.catch((err) => {
    connPromise = null;
    throw err;
  });

  return connPromise;
}

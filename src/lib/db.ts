import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/event-ticket";

const cached: Record<string, any> = {};

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise)
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => {
      cached.conn = m;
      return m;
    });
  return cached.promise;
}

import "server-only";
import { appendFile, mkdir } from "fs/promises";
import path from "path";

// NOTE on storage strategy: like the image uploader, this writes straight to
// the local filesystem (`logs/error.log`). Zero external setup, works great
// for local dev and any traditional Node.js host. It will NOT persist on
// serverless platforms with a read-only/ephemeral filesystem (e.g. Vercel) —
// if this ever deploys there, swap the appendFile calls for a hosted logging
// service (e.g. Sentry, Logtail, Axiom) while keeping the same call sites.

const LOG_DIR = path.join(process.cwd(), "logs");
const ERROR_LOG_PATH = path.join(LOG_DIR, "error.log");

interface LogContext {
  [key: string]: unknown;
}

async function ensureLogDir() {
  await mkdir(LOG_DIR, { recursive: true });
}

async function appendLine(filePath: string, entry: Record<string, unknown>) {
  try {
    await ensureLogDir();
    await appendFile(filePath, JSON.stringify(entry) + "\n", "utf8");
  } catch (writeError) {
    // If the file write itself fails (e.g. read-only filesystem in a
    // serverless environment), fall back to console so nothing is lost.
    console.error("Failed to write log file:", writeError);
  }
}

/**
 * Logs an unexpected error to `logs/error.log` with a timestamp, message,
 * stack trace, and any extra context (route, method, admin id, etc).
 * Also mirrors to the console for immediate visibility during `npm run dev`.
 */
export async function logError(error: unknown, context: LogContext = {}): Promise<void> {
  const entry = {
    level: "error" as const,
    timestamp: new Date().toISOString(),
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  };
  console.error("[ERROR]", entry.message, context);
  await appendLine(ERROR_LOG_PATH, entry);
}

export interface ErrorLogEntry {
  level: "error";
  timestamp: string;
  message: string;
  stack?: string;
  [key: string]: unknown;
}

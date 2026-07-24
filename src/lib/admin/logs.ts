import "server-only";
import { readFile } from "fs/promises";
import path from "path";
import type { ErrorLogEntry } from "@/lib/logger";

const ERROR_LOG_PATH = path.join(process.cwd(), "logs", "error.log");
const MAX_ENTRIES = 200;

/**
 * Reads `logs/error.log` (newline-delimited JSON, one entry per line),
 * returns the most recent entries first. Gracefully returns an empty list
 * if the file doesn't exist yet (i.e. no errors have been logged).
 */
export async function getErrorLogs(): Promise<ErrorLogEntry[]> {
  let raw: string;
  try {
    raw = await readFile(ERROR_LOG_PATH, "utf8");
  } catch {
    return [];
  }

  const entries: ErrorLogEntry[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      entries.push(JSON.parse(trimmed) as ErrorLogEntry);
    } catch {
      // Skip any malformed/partial line rather than failing the whole page.
    }
  }

  return entries.reverse().slice(0, MAX_ENTRIES);
}

import "server-only";
import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";

/**
 * Wraps an App Router route handler so any thrown/unexpected error is
 * caught, logged to `logs/error.log` with the request URL and method, and
 * turned into a clean 500 JSON response instead of a raw stack trace or a
 * silently failed request.
 *
 * Generic over the handler's extra arguments so it works for both static
 * routes (`(request) => ...`) and dynamic routes
 * (`(request, { params }) => ...`) without needing a shared params type.
 *
 * Validation failures (Zod `safeParse`, `requireAdmin()` returning null,
 * etc.) are NOT errors — those are handled by the normal early-return
 * responses inside each handler and never reach this catch block.
 *
 * @example
 * export const GET = withErrorLogging(async (request) => {
 *   const session = await requireAdmin();
 *   if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 *   // ...
 * });
 */
export function withErrorLogging<Args extends unknown[]>(
  handler: (request: Request, ...args: Args) => Promise<Response>
): (request: Request, ...args: Args) => Promise<Response> {
  return async (request, ...args) => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      await logError(error, { url: request.url, method: request.method });
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  };
}

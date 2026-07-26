import "server-only";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

/**
 * Resolves the current session and verifies the caller is an active ADMIN.
 * Returns `null` when the check fails so route handlers can respond with a
 * 401/403 without throwing.
 *
 * @example
 * const session = await requireAdmin();
 * if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 */
export async function requireAdmin(): Promise<Session | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

/**
 * Resolves the current session for any authenticated user (USER or ADMIN).
 * Used by account-area pages like booking history / e-tickets, where the
 * only requirement is "you're signed in as yourself" rather than a role.
 */
export async function requireUser(): Promise<Session | null> {
  const session = await auth();
  if (!session?.user) return null;
  return session;
}

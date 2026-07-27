import "server-only";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
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
 * Resolves the current signed-in site visitor from the public site's own
 * JWT/cookie auth (see `src/context/AuthContext.tsx`), not the NextAuth
 * session used by the admin dashboard — regular users never sign in through
 * NextAuth. Used by account-area pages like booking history / e-tickets,
 * where the only requirement is "you're signed in as yourself" rather than
 * a role. Returns a NextAuth-`Session`-shaped object so existing callers
 * (`session.user.id`) don't need to change.
 */
export async function requireUser(): Promise<Session | null> {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
    return { user: { id: decoded.userId, role: decoded.role } } as Session;
  } catch {
    return null;
  }
}

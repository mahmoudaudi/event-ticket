import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Runs on the Edge runtime for every matched request. Uses only the
 * edge-safe `authConfig` (no mongoose) to decode the JWT and evaluate the
 * `authorized` callback, which redirects non-admins away from `/admin/*`.
 *
 * `/bookings/*` is guarded separately in `src/app/bookings/layout.tsx`
 * instead of here: those pages check the public site's own JWT cookie
 * (`requireUser()` in `src/lib/guards.ts`), not a NextAuth session, and that
 * cookie can't be verified on the Edge runtime with the `jsonwebtoken`
 * package.
 */
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/admin/:path*"],
};

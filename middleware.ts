import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Runs on the Edge runtime for every matched request. Uses only the
 * edge-safe `authConfig` (no mongoose) to decode the JWT and evaluate the
 * `authorized` callback, which redirects non-admins away from `/admin/*`
 * and signed-out visitors away from `/bookings/*`.
 */
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/admin/:path*", "/bookings/:path*"],
};

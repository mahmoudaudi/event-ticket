import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe portion of the NextAuth configuration.
 *
 * This file MUST stay free of Node-only imports (mongoose, bcryptjs, etc.)
 * because it is consumed directly by `middleware.ts`, which runs on the
 * Edge runtime. The Credentials provider (which needs the database) is
 * added on top of this config in `src/lib/auth.ts`, which only runs in
 * Node.js contexts (API routes, Server Components, Server Actions).
 */
export const authConfig: NextAuthConfig = {
  // Self-hosted (not behind a provider NextAuth auto-detects, like Vercel),
  // so it must be told to trust the Host header — otherwise every request
  // fails with "UntrustedHost" once NODE_ENV=production (npm run start).
  trustHost: true,
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    /**
     * Route-level gate evaluated by the middleware on every matched request.
     * Only `/admin/*` is matched (see `middleware.ts`) — `/bookings/*` uses
     * the public site's own JWT cookie via `requireUser()` in
     * `src/lib/guards.ts` instead of a NextAuth session.
     */
    authorized({ auth, request }) {
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
      if (!isAdminRoute) return true;
      return auth?.user?.role === "ADMIN";
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  // Populated with the Credentials provider in `src/lib/auth.ts`.
  providers: [],
};

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
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    /**
     * Route-level gate evaluated by the middleware on every matched request.
     * Returning `false` redirects the visitor to the `signIn` page above.
     */
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (pathname.startsWith("/admin")) return auth?.user?.role === "ADMIN";
      if (pathname.startsWith("/bookings")) return Boolean(auth?.user);
      return true;
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

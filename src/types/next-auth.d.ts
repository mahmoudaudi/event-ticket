import type { DefaultSession } from "next-auth";

/**
 * Extends the built-in NextAuth (Auth.js) types so `role` and `id` are
 * available and strongly typed on both the session object (client + server)
 * and the JWT payload.
 */
declare module "next-auth" {
  interface User {
    id: string;
    role: "USER" | "ADMIN";
  }

  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "ADMIN";
  }
}

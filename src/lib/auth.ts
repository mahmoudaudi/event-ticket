import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { verifyPassword } from "@/lib/password";
import { authConfig } from "@/lib/auth.config";
import { logLoginAttempt } from "@/lib/admin/logins";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        await connectDB();
        const normalizedEmail = email.toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
          await logLoginAttempt({ email: normalizedEmail, success: false, reason: "unknown_email" });
          return null;
        }

        if (!user.isActive) {
          await logLoginAttempt({
            email: normalizedEmail,
            success: false,
            userId: user._id.toString(),
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            reason: "account_suspended",
          });
          return null;
        }

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
          await logLoginAttempt({
            email: normalizedEmail,
            success: false,
            userId: user._id.toString(),
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            reason: "invalid_password",
          });
          return null;
        }

        await logLoginAttempt({
          email: normalizedEmail,
          success: true,
          userId: user._id.toString(),
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
        });

        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role as "USER" | "ADMIN",
        };
      },
    }),
  ],
});

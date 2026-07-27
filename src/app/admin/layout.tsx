import { Manrope, Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/providers/ToastProvider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

/**
 * Scopes the admin dashboard's NextAuth session and font tokens to /admin
 * routes only, so the public site (its own JWT-based auth in
 * `src/context/AuthContext.tsx`) is unaffected.
 */
export default function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${manrope.variable} ${inter.variable} font-body antialiased`}>
      <SessionProvider>
        <ToastProvider>{children}</ToastProvider>
      </SessionProvider>
    </div>
  );
}

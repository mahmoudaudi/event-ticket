import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/providers/ToastProvider";

/**
 * Scopes the admin dashboard's NextAuth session and font tokens to /admin
 * routes only, so the public site (its own JWT-based auth in
 * `src/context/AuthContext.tsx`) is unaffected.
 */
export default function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-body antialiased">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet" />
      <SessionProvider>
        <ToastProvider>{children}</ToastProvider>
      </SessionProvider>
    </div>
  );
}

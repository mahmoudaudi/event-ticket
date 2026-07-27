"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Ticket, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/bookings", label: "My Bookings" },
] as const;

/**
 * Header for signed-in-user pages (booking history, e-tickets). Reads the
 * public site's own JWT/cookie auth context — these pages are not part of
 * the NextAuth-gated admin dashboard.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const userName = user ? `${user.firstName} ${user.lastName}` : "Account";

  return (
    <header className="border-b border-border bg-surface print:hidden">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-brand" />
          <span className="text-lg font-extrabold text-brand">Crescent Live</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold text-ink-muted hover:bg-cream-alt hover:text-ink",
                  isActive && "bg-brand-soft text-brand hover:bg-brand-soft"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">
            {userName.charAt(0)}
          </div>
          <span className="hidden text-sm font-medium text-ink sm:inline">{userName}</span>
          <button
            onClick={() => {
              logout();
              showToast("Logged out successfully", "info");
              router.push("/login");
            }}
            aria-label="Sign out"
            className="rounded-lg p-1.5 text-ink-muted hover:bg-danger-soft hover:text-danger"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

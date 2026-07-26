"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Ticket, LogOut } from "lucide-react";
import { cn } from "@/lib/cn";

interface SiteHeaderProps {
  userName: string;
}

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/bookings", label: "My Bookings" },
] as const;

/** Public-facing header for signed-in-user pages (booking history, e-tickets). Reuses the admin's design tokens. */
export function SiteHeader({ userName }: SiteHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-surface print:hidden">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-brand" />
          <span className="font-display text-lg font-extrabold text-brand">Crescent Live</span>
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
            onClick={() => signOut({ callbackUrl: "/login" })}
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

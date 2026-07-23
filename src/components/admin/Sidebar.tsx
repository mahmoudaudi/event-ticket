"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarRange,
  Ticket,
  Users,
  Settings,
  Plus,
  CircleHelp,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: CalendarRange },
  { href: "/admin/bookings", label: "Bookings", icon: Ticket },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

interface SidebarProps {
  adminName: string;
}

/** Fixed left navigation rail for the /admin section. */
export function Sidebar({ adminName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-cream-alt px-4 py-6">
      <div className="px-2">
        <h1 className="font-display text-xl font-extrabold text-brand">Admin Portal</h1>
        <p className="text-xs text-ink-muted">Crescent Live Management</p>
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-muted transition-colors hover:bg-brand-soft",
                isActive && "bg-brand text-ink-inverse hover:bg-brand"
              )}
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/admin/events/new"
        className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-ink-inverse hover:bg-brand-hover"
      >
        <Plus className="h-4 w-4" />
        New Event
      </Link>

      <div className="mt-auto flex flex-col gap-4">
        <a
          href="mailto:support@crescentlive.com"
          className="flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink"
        >
          <CircleHelp className="h-4 w-4" />
          Help Center
        </a>

        <div className="flex items-center gap-3 border-t border-border pt-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand">
            {adminName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{adminName}</p>
            <p className="text-xs text-ink-muted">Lead Admin</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            aria-label="Log out"
            className="rounded-lg p-1.5 text-ink-muted hover:bg-danger-soft hover:text-danger"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

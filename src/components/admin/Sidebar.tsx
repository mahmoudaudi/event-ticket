"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarRange,
  Ticket,
  Users,
  ScrollText,
  Settings,
  Plus,
  CircleHelp,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useMobileSidebar } from "@/components/admin/MobileSidebarContext";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: CalendarRange },
  { href: "/admin/bookings", label: "Bookings", icon: Ticket },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/logs", label: "Logs", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

interface SidebarProps {
  adminName: string;
}

/**
 * Left navigation rail for the /admin section.
 *
 * Below the `lg` breakpoint it becomes a fixed, off-canvas drawer toggled by
 * the Topbar's hamburger button (`MobileMenuButton`) via shared context; at
 * `lg` and above it reverts to a normal static column, exactly like before.
 */
export function Sidebar({ adminName }: SidebarProps) {
  const pathname = usePathname();
  const { isOpen, close } = useMobileSidebar();

  // Auto-close the mobile drawer whenever the route changes.
  useEffect(() => {
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {isOpen && (
        <button
          aria-label="Close menu"
          onClick={close}
          className="fixed inset-0 z-30 bg-charcoal/40 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-cream-alt px-4 py-6 transition-transform duration-200 ease-out",
          "lg:sticky lg:top-0 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-2">
          <div>
            <h1 className="font-display text-xl font-extrabold text-brand">Admin Portal</h1>
            <p className="text-xs text-ink-muted">Crescent Live Management</p>
          </div>
          <button onClick={close} aria-label="Close menu" className="rounded-lg p-1 text-ink-muted lg:hidden">
            <X className="h-5 w-5" />
          </button>
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
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand">
              {adminName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{adminName}</p>
              <p className="text-xs text-ink-muted">Lead Admin</p>
            </div>
            <button
              onClick={() => {
                document.cookie = "token=; path=/; max-age=0";
                document.cookie = "user=; path=/; max-age=0";
                document.cookie = "next-auth.session-token=; path=/; max-age=0";
                document.cookie = "next-auth.callback-url=; path=/; max-age=0";
                document.cookie = "next-auth.csrf-token=; path=/; max-age=0";
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
              }}
              aria-label="Log out"
              className="rounded-lg p-1.5 text-ink-muted hover:bg-danger-soft hover:text-danger"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

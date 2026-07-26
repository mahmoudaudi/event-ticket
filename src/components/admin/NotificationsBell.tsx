"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Loader2 } from "lucide-react";
import { useClickOutside } from "@/hooks/useClickOutside";
import type { NotificationsResponse } from "@/types/admin";

/** Relative time label, e.g. "2 mins ago". */
function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** Topbar bell: surfaces bookings awaiting confirmation, badge count, quick link to filtered Bookings. */
export function NotificationsBell() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<NotificationsResponse>({ count: 0, items: [] });
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useClickOutside(containerRef, () => setIsOpen(false));

  useEffect(() => {
    fetch("/api/admin/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json) setData(json);
      })
      .finally(() => setHasLoadedOnce(true));
  }, []);

  function handleToggle() {
    const willOpen = !isOpen;
    setIsOpen(willOpen);
    if (willOpen) {
      setIsLoading(true);
      fetch("/api/admin/notifications")
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json) setData(json);
        })
        .finally(() => setIsLoading(false));
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative rounded-lg border border-border bg-surface p-2.5 text-ink-muted hover:text-ink"
      >
        <Bell className="h-4.5 w-4.5" />
        {hasLoadedOnce && data.count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-ink-inverse">
            {data.count > 9 ? "9+" : data.count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-[calc(100vw-2rem)] max-w-80 rounded-lg border border-border bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-ink">Pending approvals</p>
            {data.count > 0 && <span className="text-xs text-ink-muted">{data.count} total</span>}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-ink-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : data.items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-ink-muted">You&apos;re all caught up.</p>
          ) : (
            <>
              <ul className="max-h-72 overflow-y-auto">
                {data.items.map((item) => (
                  <li key={item.id} className="border-b border-border px-4 py-3 last:border-0">
                    <p className="text-sm text-ink">{item.message}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">{timeAgo(item.createdAt)}</p>
                  </li>
                ))}
              </ul>
              <Link
                href="/admin/bookings?status=PENDING"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-center text-sm font-semibold text-brand hover:bg-cream-alt"
              >
                View all pending bookings
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

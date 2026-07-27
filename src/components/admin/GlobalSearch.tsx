"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarRange, Loader2, Search, User as UserIcon } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useClickOutside } from "@/hooks/useClickOutside";
import type { QuickSearchResult } from "@/types/admin";

/** Topbar search box: queries events + users and navigates to the right admin screen on selection. */
export function GlobalSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<QuickSearchResult>({ events: [], users: [] });

  useClickOutside(containerRef, () => setIsOpen(false));

  useEffect(() => {
    if (query.trim().length === 0) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (res.ok) setResults(await res.json());
      } catch (error) {
        if ((error as Error).name !== "AbortError") setResults({ events: [], users: [] });
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function goToEvent(id: string) {
    setIsOpen(false);
    setQuery("");
    router.push(`/admin/events/${id}/edit`);
  }

  function goToUser(email: string) {
    setIsOpen(false);
    setQuery("");
    router.push(`/admin/users?search=${encodeURIComponent(email)}`);
  }

  const hasQuery = query.trim().length > 0;
  const hasResults = results.events.length > 0 || results.users.length > 0;

  return (
    <div ref={containerRef} className="relative w-full sm:w-64">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search events or users..."
        className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm placeholder:text-ink-muted focus:border-brand"
      />

      {isOpen && hasQuery && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-lg border border-border bg-surface py-2 shadow-lg sm:left-auto sm:w-80">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-ink-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching…
            </div>
          ) : hasResults ? (
            <>
              {results.events.length > 0 && (
                <div className="mb-1">
                  <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">Events</p>
                  {results.events.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => goToEvent(event.id)}
                      className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm hover:bg-cream-alt"
                    >
                      <span className="flex items-center gap-2 truncate text-ink">
                        <CalendarRange className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                        <span className="truncate">{event.title}</span>
                      </span>
                      <StatusBadge status={event.status} kind="event" />
                    </button>
                  ))}
                </div>
              )}
              {results.users.length > 0 && (
                <div>
                  <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">Users</p>
                  {results.users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => goToUser(user.email)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-cream-alt"
                    >
                      <UserIcon className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                      <span className="truncate text-ink">{user.name}</span>
                      <span className="truncate text-xs text-ink-muted">{user.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-ink-muted">No matches for &quot;{query}&quot;.</p>
          )}
        </div>
      )}
    </div>
  );
}

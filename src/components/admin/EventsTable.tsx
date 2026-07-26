"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Copy,
  MapPin,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import type { AdminEventListItem, AdminEventListResponse } from "@/types/admin";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Select } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatCurrency, formatDate } from "@/lib/format";
import { useToast } from "@/components/providers/ToastProvider";
import { useDebouncedFetch } from "@/hooks/useDebouncedFetch";

interface EventsTableProps {
  initialData: AdminEventListResponse;
}

const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "PUBLISHED", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function EventsTable({ initialData }: EventsTableProps) {
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminEventListItem | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const url = useMemo(() => {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (status !== "ALL") params.set("status", status);
    return `/api/admin/events?${params.toString()}`;
  }, [search, status, page]);

  const { data, setData, isLoading } = useDebouncedFetch<AdminEventListResponse>(url, initialData, {
    onError: (message) => toast.error(message),
  });

  async function handleDelete(event: AdminEventListItem) {
    const res = await fetch(`/api/admin/events/${event.id}`, { method: "DELETE" });
    if (res.ok) {
      setData((prev) => ({ ...prev, events: prev.events.filter((e) => e.id !== event.id) }));
      toast.success(`"${event.title}" was deleted.`);
      router.refresh();
    } else {
      const payload = await res.json().catch(() => null);
      toast.error(payload?.error ?? `Couldn't delete "${event.title}". Please try again.`);
    }
    setOpenMenuId(null);
  }

  async function handleDuplicate(event: AdminEventListItem) {
    setDuplicatingId(event.id);
    setOpenMenuId(null);
    try {
      const res = await fetch(`/api/admin/events/${event.id}/duplicate`, { method: "POST" });
      if (!res.ok) {
        toast.error(`Couldn't duplicate "${event.title}".`);
        return;
      }
      const { id } = await res.json();
      toast.success(`Duplicated "${event.title}" as a draft.`);
      router.push(`/admin/events/${id}/edit`);
    } finally {
      setDuplicatingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-5">
        <h2 className="font-display text-lg font-bold text-ink">All Events</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Search events..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm placeholder:text-ink-muted sm:w-56"
          />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-40"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-ink-muted">
              <th className="px-5 py-3">Event Details</th>
              <th className="px-5 py-3">Date &amp; Time</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Capacity</th>
              <th className="px-5 py-3">Revenue</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={isLoading ? "opacity-60 transition-opacity" : ""}>
            {data.events.map((event) => {
              const sold = event.totalCapacity - event.remainingCapacity;
              const pctSold = event.totalCapacity > 0 ? (sold / event.totalCapacity) * 100 : 0;
              return (
                <tr key={event.id} className="border-b border-border last:border-0 hover:bg-cream-alt/50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink">{event.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
                      <MapPin className="h-3 w-3" />
                      {event.venue} · {event.city}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-ink-muted">
                    <p className="flex items-center gap-1.5 text-ink">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(event.eventDate)}
                    </p>
                    <p className="mt-0.5 text-xs">
                      {event.startTime} – {event.endTime}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={event.status} kind="event" />
                  </td>
                  <td className="px-5 py-4">
                    <p className="mb-1 text-xs text-ink-muted">
                      {sold} / {event.totalCapacity}
                    </p>
                    <ProgressBar value={pctSold} className="w-28" />
                  </td>
                  <td className="px-5 py-4 font-semibold text-ink">{formatCurrency(event.revenue)}</td>
                  <td className="relative px-5 py-4 text-right">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === event.id ? null : event.id)}
                      aria-label="Row actions"
                      disabled={duplicatingId === event.id}
                      className="rounded-lg p-1.5 text-ink-muted hover:bg-cream-alt hover:text-ink disabled:opacity-50"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {openMenuId === event.id && (
                      <div className="absolute right-5 top-12 z-10 w-44 rounded-lg border border-border bg-surface py-1 text-left shadow-lg">
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-cream-alt"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDuplicate(event)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-cream-alt"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Duplicate
                        </button>
                        <button
                          onClick={() => setPendingDelete(event)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-soft"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data.events.length === 0 && <EmptyState searchTerm={search || undefined} title={search ? undefined : "No events yet"} description={search ? undefined : "Create your first event to get started."} />}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-4 text-sm text-ink-muted">
        <span>
          Showing {data.events.length === 0 ? 0 : (data.page - 1) * 10 + 1}–
          {(data.page - 1) * 10 + data.events.length} of {data.total} events
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={data.page <= 1}
            aria-label="Previous page"
            className="rounded-lg border border-border p-1.5 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={data.page >= data.totalPages}
            aria-label="Next page"
            className="rounded-lg border border-border p-1.5 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) return handleDelete(pendingDelete);
        }}
        title="Delete this event?"
        description={`"${pendingDelete?.title}" and its ticket tiers will be permanently removed. This can't be undone.`}
        confirmLabel="Delete event"
      />
    </div>
  );
}

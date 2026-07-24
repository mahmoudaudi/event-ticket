"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Download, Eye, X } from "lucide-react";
import type { AdminBookingListItem, AdminBookingListResponse } from "@/types/admin";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { BookingDetailModal } from "@/components/admin/BookingDetailModal";
import { formatCurrency, formatDate } from "@/lib/format";
import { useToast } from "@/components/providers/ToastProvider";
import { useDebouncedFetch } from "@/hooks/useDebouncedFetch";

interface BookingsTableProps {
  initialData: AdminBookingListResponse;
  initialStatus?: string;
}

const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const DATE_RANGE_OPTIONS = [
  { value: "ALL", label: "All time" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

export function BookingsTable({ initialData, initialStatus = "ALL" }: BookingsTableProps) {
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [dateRange, setDateRange] = useState("ALL");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pendingCancel, setPendingCancel] = useState<AdminBookingListItem | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const filterParams = useMemo(() => {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (status !== "ALL") params.set("status", status);
    if (dateRange !== "ALL") params.set("dateRange", dateRange);
    return params;
  }, [search, status, dateRange, page]);

  const { data, setData, isLoading } = useDebouncedFetch<AdminBookingListResponse>(
    `/api/admin/bookings?${filterParams.toString()}`,
    initialData,
    { onError: (message) => toast.error(message) }
  );

  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
    setSelectedIds(new Set());
  }

  async function handleStatusChange(id: string, next: "CONFIRMED" | "CANCELLED") {
    setUpdatingId(id);
    const booking = data.bookings.find((b) => b.id === id);
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      setData((prev) => ({
        ...prev,
        bookings: prev.bookings.map((b) => (b.id === id ? { ...b, bookingStatus: next } : b)),
      }));
      toast.success(
        next === "CONFIRMED"
          ? `Booking #${booking?.bookingReference} confirmed.`
          : `Booking #${booking?.bookingReference} cancelled.`
      );
      router.refresh();
    } else {
      toast.error("Couldn't update that booking. Please try again.");
    }
    setUpdatingId(null);
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === data.bookings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.bookings.map((b) => b.id)));
    }
  }

  async function handleBulkAction(next: "CONFIRMED" | "CANCELLED") {
    setIsBulkUpdating(true);
    try {
      const res = await fetch("/api/admin/bookings/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds), status: next }),
      });
      if (!res.ok) {
        toast.error("Couldn't update the selected bookings.");
        return;
      }
      const { updatedCount } = await res.json();
      setData((prev) => ({
        ...prev,
        bookings: prev.bookings.map((b) => (selectedIds.has(b.id) ? { ...b, bookingStatus: next } : b)),
      }));
      toast.success(`${updatedCount} booking${updatedCount === 1 ? "" : "s"} ${next === "CONFIRMED" ? "confirmed" : "cancelled"}.`);
      setSelectedIds(new Set());
      router.refresh();
    } finally {
      setIsBulkUpdating(false);
    }
  }

  function handleExport() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status !== "ALL") params.set("status", status);
    if (dateRange !== "ALL") params.set("dateRange", dateRange);
    window.open(`/api/admin/bookings/export?${params.toString()}`, "_blank");
  }

  const allSelected = data.bookings.length > 0 && selectedIds.size === data.bookings.length;

  return (
    <div className="rounded-2xl border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-5">
        <h2 className="font-display text-lg font-bold text-ink">Search Bookings</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Search by ID, user, or event name..."
            value={search}
            onChange={(e) => updateFilter(setSearch, e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm placeholder:text-ink-muted sm:w-64"
          />
          <Select
            value={status}
            onChange={(e) => updateFilter(setStatus, e.target.value)}
            className="w-full sm:w-40"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          <Select
            value={dateRange}
            onChange={(e) => updateFilter(setDateRange, e.target.value)}
            className="w-full sm:w-40"
          >
            {DATE_RANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Download className="h-4 w-4" />}
            onClick={handleExport}
          >
            Export
          </Button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-brand-soft px-5 py-3">
          <p className="text-sm font-medium text-ink">
            {selectedIds.size} booking{selectedIds.size === 1 ? "" : "s"} selected
          </p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => handleBulkAction("CONFIRMED")} isLoading={isBulkUpdating}>
              Confirm selected
            </Button>
            <Button size="sm" variant="danger" onClick={() => handleBulkAction("CANCELLED")} isLoading={isBulkUpdating}>
              Cancel selected
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-ink-muted">
              <th className="w-10 px-5 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  aria-label="Select all bookings"
                  className="h-4 w-4 rounded border-border"
                />
              </th>
              <th className="px-5 py-3">Booking ID</th>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Event</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={isLoading ? "opacity-60 transition-opacity" : ""}>
            {data.bookings.map((booking) => (
              <tr key={booking.id} className="border-b border-border last:border-0 hover:bg-cream-alt/50">
                <td className="px-5 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(booking.id)}
                    onChange={() => toggleSelected(booking.id)}
                    aria-label={`Select booking ${booking.bookingReference}`}
                    className="h-4 w-4 rounded border-border"
                  />
                </td>
                <td className="px-5 py-4 font-semibold text-brand">#{booking.bookingReference}</td>
                <td className="px-5 py-4">
                  <p className="font-medium text-ink">{booking.userName}</p>
                  <p className="text-xs text-ink-muted">{booking.userEmail}</p>
                </td>
                <td className="px-5 py-4 text-ink">{booking.eventTitle}</td>
                <td className="px-5 py-4 text-ink-muted">{formatDate(booking.createdAt)}</td>
                <td className="px-5 py-4 font-semibold text-ink">{formatCurrency(booking.total)}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={booking.bookingStatus} kind="booking" />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    {booking.bookingStatus === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(booking.id, "CONFIRMED")}
                          disabled={updatingId === booking.id}
                          aria-label="Confirm booking"
                          className="rounded-lg p-1.5 text-success hover:bg-success-soft disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setPendingCancel(booking)}
                          disabled={updatingId === booking.id}
                          aria-label="Cancel booking"
                          className="rounded-lg p-1.5 text-danger hover:bg-danger-soft disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setViewingId(booking.id)}
                      aria-label="View booking"
                      className="rounded-lg p-1.5 text-ink-muted hover:bg-cream-alt hover:text-ink"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.bookings.length === 0 && (
          <EmptyState
            searchTerm={search || undefined}
            title={search ? undefined : "No bookings yet"}
            description={search ? undefined : "Bookings will appear here once customers start reserving tickets."}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-4 text-sm text-ink-muted">
        <span>
          Showing {data.bookings.length === 0 ? 0 : (data.page - 1) * 10 + 1}–
          {(data.page - 1) * 10 + data.bookings.length} of {data.total} bookings
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
        open={pendingCancel !== null}
        onClose={() => setPendingCancel(null)}
        onConfirm={() => {
          if (pendingCancel) return handleStatusChange(pendingCancel.id, "CANCELLED");
        }}
        title="Cancel this booking?"
        description={`Booking #${pendingCancel?.bookingReference} for ${pendingCancel?.userName} will be marked as cancelled.`}
        confirmLabel="Cancel booking"
      />

      <BookingDetailModal bookingId={viewingId} onClose={() => setViewingId(null)} />
    </div>
  );
}

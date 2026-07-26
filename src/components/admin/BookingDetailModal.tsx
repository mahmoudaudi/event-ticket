"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import type { AdminBookingDetail } from "@/types/admin";

interface BookingDetailModalProps {
  bookingId: string | null;
  onClose: () => void;
}

export function BookingDetailModal({ bookingId, onClose }: BookingDetailModalProps) {
  const [detail, setDetail] = useState<AdminBookingDetail | null>(null);
  // Tracks which booking the current `detail` belongs to, so loading state
  // can be derived instead of set synchronously at the top of the effect.
  const [loadedForId, setLoadedForId] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    fetch(`/api/admin/bookings/${bookingId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setDetail(data);
        setLoadedForId(bookingId);
      });
  }, [bookingId]);

  const isLoading = bookingId !== null && loadedForId !== bookingId;

  return (
    <Modal
      open={bookingId !== null}
      onClose={onClose}
      title={detail ? `Booking #${detail.bookingReference}` : "Booking details"}
      widthClassName="max-w-lg"
    >
      {isLoading || !detail ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-5 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-ink">{detail.eventTitle}</p>
              <p className="text-xs text-ink-muted">
                {detail.eventVenue} · {detail.eventDate && formatDate(detail.eventDate)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <StatusBadge status={detail.bookingStatus} kind="booking" />
              <StatusBadge status={detail.paymentStatus} kind="payment" />
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <p className="mb-1 font-medium text-ink">{detail.userName}</p>
            <p className="text-xs text-ink-muted">{detail.userEmail}</p>
          </div>

          <div>
            <p className="mb-2 font-semibold text-ink">Tickets</p>
            <ul className="flex flex-col gap-2">
              {detail.tickets.map((ticket, i) => (
                <li key={i} className="flex items-center justify-between text-ink-muted">
                  <span>
                    {ticket.name} × {ticket.quantity}
                  </span>
                  <span className="font-medium text-ink">{formatCurrency(ticket.totalPrice)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-1 border-t border-border pt-4">
            <div className="flex justify-between text-ink-muted">
              <span>Subtotal</span>
              <span>{formatCurrency(detail.subtotal)}</span>
            </div>
            {detail.discount > 0 && (
              <div className="flex justify-between text-ink-muted">
                <span>Discount</span>
                <span>-{formatCurrency(detail.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-ink">
              <span>Total</span>
              <span>{formatCurrency(detail.total)}</span>
            </div>
          </div>

          <p className="text-xs text-ink-muted">Booked {formatDateTime(detail.createdAt)}</p>
        </div>
      )}
    </Modal>
  );
}

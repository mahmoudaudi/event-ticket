import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { UserBookingListItem } from "@/types/user";

interface BookingCardProps {
  booking: UserBookingListItem;
}

export function BookingCard({ booking }: BookingCardProps) {
  return (
    <Link
      href={`/bookings/${booking.id}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md sm:flex-row"
    >
      <div className="relative h-40 w-full shrink-0 bg-cream-alt sm:h-auto sm:w-48">
        {booking.eventBannerImage ? (
          <Image
            src={booking.eventBannerImage}
            alt=""
            fill
            sizes="192px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Ticket className="h-8 w-8 text-ink-muted" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-display text-lg font-bold text-ink">{booking.eventTitle}</h3>
          <StatusBadge status={booking.bookingStatus} kind="booking" />
        </div>

        <div className="flex flex-col gap-1 text-sm text-ink-muted">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {booking.eventDate ? formatDate(booking.eventDate) : "Date TBA"}
            {booking.startTime && ` · ${booking.startTime}`}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {booking.eventVenue}
            {booking.eventCity && `, ${booking.eventCity}`}
          </span>
        </div>

        <p className="text-sm text-ink-muted">{booking.ticketSummary}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xs text-ink-muted">#{booking.bookingReference}</span>
          <span className="font-display font-bold text-ink">{formatCurrency(booking.total)}</span>
        </div>
      </div>
    </Link>
  );
}

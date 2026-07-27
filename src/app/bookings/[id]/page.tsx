import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Ticket as TicketIcon, Info, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrintTicketButton } from "@/components/site/PrintTicketButton";
import { CancelBookingButton } from "@/components/site/CancelBookingButton";
import { getUserBookingDetail } from "@/lib/user/bookings";
import { requireUser } from "@/lib/guards";
import { generateQrCodeSvg } from "@/lib/qrcode";
import { formatDate } from "@/lib/format";

export const metadata = { title: "E-Ticket" };
export const dynamic = "force-dynamic";

interface ETicketPageProps {
  params: Promise<{ id: string }>;
}

export default async function ETicketPage({ params }: ETicketPageProps) {
  const { id } = await params;
  const session = await requireUser();
  if (!session) notFound();

  const result = await getUserBookingDetail(session.user.id, id);
  if (result.status === "not_found") notFound();

  if (result.status === "event_removed") {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warning-soft">
          <Info className="h-6 w-6 text-warning" />
        </div>
        <h1 className="font-display text-xl font-bold text-ink">This event is no longer available</h1>
        <p className="text-sm text-ink-muted">
          Booking #{result.bookingReference} was for an event that has since been removed by the organizer. If you
          believe this is a mistake, please contact support.
        </p>
        <Link href="/bookings" className="mt-2 text-sm font-semibold text-brand hover:underline">
          Back to My Bookings
        </Link>
      </div>
    );
  }

  const booking = result.booking;
  const qrSvg = await generateQrCodeSvg(booking.qrCode);
  const hasSeats = booking.seats.length > 0;
  const eventDateObj = new Date(booking.event.eventDate);
  const dateMonth = new Intl.DateTimeFormat("en-US", { month: "short" }).format(eventDateObj).toUpperCase();
  const dateDay = eventDateObj.getDate();
  const dateYear = eventDateObj.getFullYear();
  const attendeeSubtitle = hasSeats ? "Reserved Seating" : (booking.tickets[0]?.name ?? "General Admission");

  return (
    <div className="flex flex-col gap-8">
      <div className="print:hidden">
        <Link href="/bookings" className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          Back to My Bookings
        </Link>
      </div>

      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex items-center gap-2 text-ink-muted">
          <TicketIcon className="h-[18px] w-[18px]" />
          <span className="text-xs font-semibold uppercase tracking-widest">Digital Ticket Holder</span>
        </div>

        {/* Main ticket card */}
        <div className="relative flex min-h-[480px] flex-col overflow-hidden rounded-xl bg-surface shadow-xl md:flex-row print:shadow-none">
          {/* Details panel */}
          <div className="relative flex flex-1 flex-col justify-between p-8 lg:p-12">
            <span className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-brand via-gold to-brand" />

            <div>
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  {booking.event.categoryName && (
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-brand">
                      {booking.event.categoryName}
                    </span>
                  )}
                  <h1 className="font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">
                    {booking.event.title}
                  </h1>
                </div>
                <div className="shrink-0 rounded-md bg-cream-alt px-4 py-2 text-center">
                  <CalendarDays className="mx-auto mb-1 h-5 w-5 text-brand" />
                  <p className="font-display text-lg font-bold text-ink">{dateMonth} {dateDay}</p>
                  <p className="text-xs text-ink-muted">{dateYear}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Venue</span>
                  <p className="font-display font-semibold text-ink">{booking.event.venue}</p>
                  <p className="text-sm text-ink-muted">{booking.event.city}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Time</span>
                  <p className="font-display font-semibold text-ink">{booking.event.startTime}</p>
                  <p className="text-sm text-ink-muted">Doors — check event listing</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Attendee</span>
                  <p className="font-display font-semibold text-ink">{booking.holderName}</p>
                  <p className="text-sm text-ink-muted">{attendeeSubtitle}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Order ID</span>
                  <p className="font-mono text-sm text-ink-muted">#{booking.bookingReference}</p>
                </div>
              </div>
            </div>

            {hasSeats ? (
              <div className="mt-10 flex items-center justify-between rounded-lg bg-cream-alt p-5">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase text-ink-muted">Section</span>
                  <span className="font-display text-lg font-bold text-brand">{booking.seats[0].section}</span>
                </div>
                <span className="h-8 w-px bg-border" />
                <div className="flex flex-col text-center">
                  <span className="text-xs font-semibold uppercase text-ink-muted">Row</span>
                  <span className="font-display text-lg font-bold text-ink">{booking.seats[0].row}</span>
                </div>
                <span className="h-8 w-px bg-border" />
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold uppercase text-ink-muted">
                    {booking.seats.length > 1 ? "Seats" : "Seat"}
                  </span>
                  <span className="font-display text-lg font-bold text-ink">
                    {booking.seats.map((s) => s.seatNumber).join(", ")}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-10 flex flex-col gap-2 rounded-lg bg-cream-alt p-5">
                <span className="text-xs font-semibold uppercase text-ink-muted">Tickets</span>
                {booking.tickets.map((ticket, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-display font-semibold text-ink">
                      {ticket.name} × {ticket.quantity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Perforated divider — desktop only */}
          <div className="relative hidden flex-col items-center justify-between py-4 md:flex">
            <span className="-mt-4 h-8 w-8 rounded-full bg-cream" />
            <span className="mx-4 flex-1 border-r-2 border-dashed border-border" />
            <span className="-mb-4 h-8 w-8 rounded-full bg-cream" />
          </div>

          {/* QR panel */}
          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-cream-alt p-8 text-center md:w-80 lg:p-12">
            <span className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-brand">Scan to Enter</span>
            <div
              className="mb-6 h-40 w-40 rounded-xl bg-white p-4 shadow-md [&_svg]:h-full [&_svg]:w-full"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <p className="font-display font-bold text-ink">ADMIT ONE</p>
            <p className="text-xs text-ink-muted">Valid only for date shown</p>
            <div className="mt-6 flex flex-col items-center gap-1.5">
              <StatusBadge status={booking.bookingStatus} kind="booking" />
              <StatusBadge status={booking.paymentStatus} kind="payment" />
            </div>
          </div>
        </div>

        {/* Footer: policy + actions */}
        <div className="mt-6 flex flex-col items-start justify-between gap-6 px-4 md:flex-row md:items-center print:hidden">
          <p className="max-w-md text-sm leading-relaxed text-ink-muted">
            <span className="font-bold text-brand">Policy:</span> No refunds or exchanges. Early arrival is
            recommended to ensure smooth entry.
          </p>
          <div className="flex items-center gap-3">
            {booking.bookingStatus === "CONFIRMED" && <CancelBookingButton bookingId={id} />}
            <PrintTicketButton label="Save as PDF" />
          </div>
        </div>

        {/* Real venue photo, only shown when the event actually has one */}
        {booking.event.bannerImage && (
          <div className="relative mt-10 h-56 overflow-hidden rounded-xl print:hidden sm:h-64">
            <Image
              src={booking.event.bannerImage}
              alt=""
              fill
              sizes="800px"
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
            <div className="absolute bottom-6 left-6 flex items-center gap-1.5 text-ink-inverse">
              <MapPin className="h-4 w-4" />
              <p className="text-sm font-medium">
                {booking.event.venue}, {booking.event.city}
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-xs text-ink-muted print:hidden">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Booked {formatDate(booking.createdAt)}. Need help? Contact the venue directly for seating or
            accessibility requirements.
          </span>
        </div>
      </div>
    </div>
  );
}

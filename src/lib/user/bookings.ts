import "server-only";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Booking } from "@/models";
import type { UserBookingListItem, BookingDetailResult } from "@/types/user";

/** All bookings for the given user, newest first, split by whether the event is upcoming or past. */
export async function getUserBookings(userId: string): Promise<UserBookingListItem[]> {
  await connectDB();

  const rows = await Booking.aggregate([
    { $match: { userId: new Types.ObjectId(userId) } },
    { $lookup: { from: "events", localField: "eventId", foreignField: "_id", as: "event" } },
    { $addFields: { event: { $arrayElemAt: ["$event", 0] } } },
    {
      $lookup: {
        from: "tickettypes",
        localField: "tickets.ticketTypeId",
        foreignField: "_id",
        as: "ticketTypeDocs",
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  const now = new Date();

  return rows.map((row) => {
    const ticketTypeNameById = new Map<string, string>(
      row.ticketTypeDocs.map((t: { _id: Types.ObjectId; name: string }) => [t._id.toString(), t.name])
    );
    const ticketSummary = row.tickets
      .map((t: { ticketTypeId: Types.ObjectId; quantity: number }) => {
        const name = ticketTypeNameById.get(t.ticketTypeId.toString()) ?? "Ticket";
        return `${t.quantity}x ${name}`;
      })
      .join(", ");

    return {
      id: row._id.toString(),
      bookingReference: row.bookingReference,
      eventTitle: row.event?.title ?? "Event",
      eventBannerImage: row.event?.bannerImage || undefined,
      eventVenue: row.event?.venue ?? "",
      eventCity: row.event?.city ?? "",
      eventDate: row.event?.eventDate ? new Date(row.event.eventDate).toISOString() : "",
      startTime: row.event?.startTime ?? "",
      bookingStatus: row.bookingStatus,
      paymentStatus: row.paymentStatus,
      total: row.total,
      ticketSummary,
      isUpcoming: row.event?.eventDate ? new Date(row.event.eventDate) >= now : false,
    };
  });
}

/**
 * A single booking's full detail for the e-ticket view.
 *
 * Distinguishes two different failure modes on purpose:
 * - `not_found`: the booking doesn't exist, or belongs to a different user
 *   — the page should 404, and must never reveal which of those it was.
 * - `event_removed`: the booking is genuinely this user's, but the event it
 *   was for has since been deleted. This is NOT a security case — the user
 *   already knows they booked something — so the page can say so plainly
 *   instead of showing a generic "not found".
 */
export async function getUserBookingDetail(userId: string, bookingId: string): Promise<BookingDetailResult> {
  if (!Types.ObjectId.isValid(bookingId)) {
    console.warn(`[getUserBookingDetail] "${bookingId}" is not a valid ObjectId.`);
    return { status: "not_found" };
  }
  await connectDB();

  const rows = await Booking.aggregate([
    { $match: { _id: new Types.ObjectId(bookingId), userId: new Types.ObjectId(userId) } },
    { $lookup: { from: "events", localField: "eventId", foreignField: "_id", as: "event" } },
    { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
    { $addFields: { event: { $arrayElemAt: ["$event", 0] }, user: { $arrayElemAt: ["$user", 0] } } },
    {
      $lookup: {
        from: "categories",
        localField: "event.categoryId",
        foreignField: "_id",
        as: "categoryDocs",
      },
    },
    {
      $lookup: {
        from: "tickettypes",
        localField: "tickets.ticketTypeId",
        foreignField: "_id",
        as: "ticketTypeDocs",
      },
    },
    {
      // Forward-compatible with seat-based bookings: joins through
      // ReservedSeat -> Seat if a link ever exists for this booking.
      // Returns an empty array today since nothing writes ReservedSeat yet.
      $lookup: {
        from: "reservedseats",
        localField: "_id",
        foreignField: "bookingId",
        as: "reservedSeats",
      },
    },
    {
      $lookup: {
        from: "seats",
        localField: "reservedSeats.seatId",
        foreignField: "_id",
        as: "seatDocs",
      },
    },
  ]);

  const row = rows[0];
  if (!row) {
    console.warn(
      `[getUserBookingDetail] No booking ${bookingId} found for user ${userId}. ` +
        `Either it doesn't exist, belongs to a different user, or the DB connection was still warming up.`
    );
    return { status: "not_found" };
  }
  if (!row.event) {
    console.warn(`[getUserBookingDetail] Booking ${bookingId} exists but its linked event is missing (deleted?).`);
    return {
      status: "event_removed",
      bookingReference: row.bookingReference,
      createdAt: row.createdAt.toISOString(),
    };
  }

  const ticketTypeNameById = new Map<string, string>(
    row.ticketTypeDocs.map((t: { _id: Types.ObjectId; name: string }) => [t._id.toString(), t.name])
  );

  return {
    status: "ok",
    booking: {
      id: row._id.toString(),
      bookingReference: row.bookingReference,
      bookingStatus: row.bookingStatus,
      paymentStatus: row.paymentStatus,
      createdAt: row.createdAt.toISOString(),
      event: {
        id: row.event._id.toString(),
        title: row.event.title,
        bannerImage: row.event.bannerImage || undefined,
        categoryName: row.categoryDocs[0]?.name,
        venue: row.event.venue,
        address: row.event.address,
        city: row.event.city,
        eventDate: new Date(row.event.eventDate).toISOString(),
        startTime: row.event.startTime,
        endTime: row.event.endTime,
        organizer: row.event.organizer,
      },
      tickets: row.tickets.map((t: { ticketTypeId: Types.ObjectId; quantity: number; unitPrice: number; totalPrice: number }) => ({
        name: ticketTypeNameById.get(t.ticketTypeId.toString()) ?? "Ticket",
        quantity: t.quantity,
        unitPrice: t.unitPrice,
        totalPrice: t.totalPrice,
      })),
      seats: row.seatDocs.map((s: { section: string; row: string; seatNumber: string }) => ({
        section: s.section,
        row: s.row,
        seatNumber: s.seatNumber,
      })),
      subtotal: row.subtotal ?? row.total,
      discount: row.discount ?? 0,
      total: row.total,
      qrCode: row.qrCode || row.bookingReference,
      holderName: row.user ? `${row.user.firstName} ${row.user.lastName}` : "",
      holderEmail: row.user?.email ?? "",
    },
  };
}

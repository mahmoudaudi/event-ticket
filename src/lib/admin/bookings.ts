import "server-only";
import { Types, type PipelineStage } from "mongoose";
import { connectDB } from "@/lib/db";
import { Booking, Seat } from "@/models";
import { escapeRegex } from "@/lib/regex";
import { logAdminActivity } from "@/lib/admin/activity";
import type { AdminBookingListItem, AdminBookingListResponse, AdminBookingDetail, BookingDateRange } from "@/types/admin";
import ReservedSeat from "@/models/ReservedSeat";
export type { BookingDateRange } from "@/types/admin";

const PAGE_SIZE = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export interface BookingListParams {
  page?: number;
  search?: string;
  status?: string;
  dateRange?: BookingDateRange;
}

/** Builds the shared aggregation pipeline (lookups + filters) reused by list, count, and export. */
function buildBookingsPipeline(params: BookingListParams): PipelineStage[] {
  const match: Record<string, unknown> = {};
  if (params.status && params.status !== "ALL") {
    match.bookingStatus = params.status;
  }
  if (params.dateRange && params.dateRange !== "ALL") {
    const days = Number(params.dateRange);
    match.createdAt = { $gte: new Date(Date.now() - days * DAY_MS) };
  }

  const pipeline: PipelineStage[] = [
    { $match: match },
    { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
    { $lookup: { from: "events", localField: "eventId", foreignField: "_id", as: "event" } },
    { $addFields: { user: { $arrayElemAt: ["$user", 0] }, event: { $arrayElemAt: ["$event", 0] } } },
  ];

  if (params.search) {
    const term = escapeRegex(params.search);
    pipeline.push({
      $match: {
        $or: [
          { bookingReference: { $regex: term, $options: "i" } },
          { "user.firstName": { $regex: term, $options: "i" } },
          { "user.lastName": { $regex: term, $options: "i" } },
          { "user.email": { $regex: term, $options: "i" } },
          { "event.title": { $regex: term, $options: "i" } },
        ],
      },
    });
  }

  return pipeline;
}

interface RawBookingRow {
  _id: Types.ObjectId;
  bookingReference: string;
  user?: { firstName: string; lastName: string; email: string } | null;
  event?: { _id: Types.ObjectId; title: string; venue?: string; eventDate?: Date } | null;
  createdAt: Date;
  total: number;
  bookingStatus: "PENDING" | "CONFIRMED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
}

function toListItem(row: RawBookingRow): AdminBookingListItem {
  return {
    id: row._id.toString(),
    bookingReference: row.bookingReference,
    userName: row.user ? `${row.user.firstName} ${row.user.lastName}` : "Unknown user",
    userEmail: row.user?.email ?? "",
    eventTitle: row.event?.title ?? "Unknown event",
    eventId: row.event?._id?.toString() ?? "",
    createdAt: row.createdAt.toISOString(),
    total: row.total,
    bookingStatus: row.bookingStatus,
    paymentStatus: row.paymentStatus,
  };
}

/** Paginated, searchable, filterable bookings list for the admin table. */
export async function getAdminBookingsList(params: BookingListParams): Promise<AdminBookingListResponse> {
  await connectDB();

  const page = Math.max(1, params.page ?? 1);
  const pipeline = buildBookingsPipeline(params);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [rows, totalAgg, pendingCount, confirmedTodayCount, cancelledCount, bookingsThisMonth, bookingsLastMonth] =
    await Promise.all([
      Booking.aggregate([
        ...pipeline,
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * PAGE_SIZE },
        { $limit: PAGE_SIZE },
      ]),
      Booking.aggregate([...pipeline, { $count: "total" }]),
      Booking.countDocuments({ bookingStatus: "PENDING" }),
      Booking.countDocuments({ bookingStatus: "CONFIRMED", updatedAt: { $gte: startOfToday } }),
      Booking.countDocuments({ bookingStatus: "CANCELLED" }),
      Booking.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Booking.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } }),
    ]);

  return {
    bookings: rows.map(toListItem),
    page,
    totalPages: Math.max(1, Math.ceil((totalAgg[0]?.total ?? 0) / PAGE_SIZE)),
    total: totalAgg[0]?.total ?? 0,
    summary: {
      pendingCount,
      confirmedTodayCount,
      cancelledCount,
      growthTrend: pctChange(bookingsThisMonth, bookingsLastMonth),
    },
  };
}

/** All bookings matching the current filters, unpaginated — used for CSV export. */
export async function getAdminBookingsForExport(params: BookingListParams): Promise<AdminBookingListItem[]> {
  await connectDB();
  const pipeline = buildBookingsPipeline(params);
  const rows = await Booking.aggregate([...pipeline, { $sort: { createdAt: -1 } }]);
  return rows.map(toListItem);
}

/** Full booking record with ticket line items, for the booking detail modal. */
export async function getAdminBookingDetail(id: string): Promise<AdminBookingDetail | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectDB();

  const rows = await Booking.aggregate([
    { $match: { _id: new Types.ObjectId(id) } },
    { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
    { $lookup: { from: "events", localField: "eventId", foreignField: "_id", as: "event" } },
    { $lookup: { from: "tickettypes", localField: "tickets.ticketTypeId", foreignField: "_id", as: "ticketTypeDocs" } },
    { $addFields: { user: { $arrayElemAt: ["$user", 0] }, event: { $arrayElemAt: ["$event", 0] } } },
  ]);
  const row = rows[0];
  if (!row) return null;

  const ticketTypeNameById = new Map<string, string>(
    row.ticketTypeDocs.map((t: { _id: Types.ObjectId; name: string }) => [t._id.toString(), t.name])
  );

  return {
    ...toListItem(row),
    eventVenue: row.event?.venue ?? "",
    eventDate: row.event?.eventDate?.toISOString() ?? "",
    tickets: row.tickets.map((t: { ticketTypeId: Types.ObjectId; quantity: number; unitPrice: number; totalPrice: number }) => ({
      name: ticketTypeNameById.get(t.ticketTypeId.toString()) ?? "Ticket",
      quantity: t.quantity,
      unitPrice: t.unitPrice,
      totalPrice: t.totalPrice,
    })),
    subtotal: row.subtotal ?? row.total,
    discount: row.discount ?? 0,
    qrCode: row.qrCode,
  };
}

export interface AdminIdentity {
  id: string;
  name: string;
}

/** Confirms or cancels a booking and records the action in the audit log. Returns the booking reference, or null if not found. */
export async function updateBookingStatus(
  id: string,
  status: "CONFIRMED" | "CANCELLED",
  admin: AdminIdentity
): Promise<string | null> {
  if (!Types.ObjectId.isValid(id)) throw new Error("Invalid booking id");
  await connectDB();

  const existing = await Booking.findById(id);
  if (!existing) return null;

  // Idempotent: a repeat call (double-click, retried request) with the same
  // target status is a no-op — don't re-write the record or log a
  // duplicate/misleading audit entry for something that didn't change.
  if (existing.bookingStatus === status) return existing.bookingReference;

  const booking = await Booking.findByIdAndUpdate(id, { bookingStatus: status }, { new: true });
  if (!booking) return null;

  // If cancelling, free the reserved seats back to AVAILABLE
  if (status === "CANCELLED") {
    const reservedSeats = await ReservedSeat.find({ bookingId: new Types.ObjectId(id) });
    const seatIds = reservedSeats.map((rs) => rs.seatId);
    if (seatIds.length > 0) {
      await Seat.updateMany(
        { _id: { $in: seatIds } },
        { $set: { status: "AVAILABLE" } }
      );
    }
  }

  await logAdminActivity({
    adminId: admin.id,
    adminName: admin.name,
    action: status === "CONFIRMED" ? "BOOKING_CONFIRMED" : "BOOKING_CANCELLED",
    message: `${admin.name} ${status === "CONFIRMED" ? "confirmed" : "cancelled"} booking #${booking.bookingReference}.`,
  });

  return booking.bookingReference;
}

/** Confirms or cancels many bookings at once (bulk action bar), one audit log entry per booking. */
export async function bulkUpdateBookingStatus(
  ids: string[],
  status: "CONFIRMED" | "CANCELLED",
  admin: AdminIdentity
): Promise<number> {
  await connectDB();
  const validIds = ids.filter((id) => Types.ObjectId.isValid(id));
  const bookings = await Booking.find({ _id: { $in: validIds } });

  // Same idempotency guard as the single-booking path: skip any booking
  // that's already in the target state instead of re-writing it and
  // logging a no-op audit entry.
  const changingBookings = bookings.filter((b) => b.bookingStatus !== status);
  if (changingBookings.length === 0) return 0;

  await Booking.updateMany({ _id: { $in: changingBookings.map((b) => b._id) } }, { bookingStatus: status });

  // If cancelling, free the reserved seats back to AVAILABLE
  if (status === "CANCELLED") {
    const allReservedSeats = await ReservedSeat.find({
      bookingId: { $in: changingBookings.map((b) => b._id) },
    });
    const allSeatIds = allReservedSeats.map((rs) => rs.seatId);
    if (allSeatIds.length > 0) {
      await Seat.updateMany(
        { _id: { $in: allSeatIds } },
        { $set: { status: "AVAILABLE" } }
      );
    }
  }

  await Promise.all(
    changingBookings.map((booking) =>
      logAdminActivity({
        adminId: admin.id,
        adminName: admin.name,
        action: status === "CONFIRMED" ? "BOOKING_CONFIRMED" : "BOOKING_CANCELLED",
        message: `${admin.name} ${status === "CONFIRMED" ? "confirmed" : "cancelled"} booking #${booking.bookingReference}.`,
      })
    )
  );

  return changingBookings.length;
}

import "server-only";
import { connectDB } from "@/lib/db";
import { Event } from "@/models";

export interface CalendarEventItem {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  bookingCount: number;
  day: number; // day-of-month (1-31), for grouping into calendar cells
}

/** All events falling within the given month, with each event's total booking count. */
export async function getCalendarEvents(year: number, month: number /* 1-12 */): Promise<CalendarEventItem[]> {
  await connectDB();
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1); // first day of the following month (exclusive upper bound)

  const rows = await Event.aggregate([
    { $match: { eventDate: { $gte: start, $lt: end } } },
    { $lookup: { from: "bookings", localField: "_id", foreignField: "eventId", as: "bookings" } },
    { $addFields: { bookingCount: { $size: "$bookings" } } },
    { $project: { bookings: 0 } },
    { $sort: { eventDate: 1 } },
  ]);

  return rows.map((row) => ({
    id: row._id.toString(),
    title: row.title,
    status: row.status,
    bookingCount: row.bookingCount,
    day: new Date(row.eventDate).getDate(),
  }));
}

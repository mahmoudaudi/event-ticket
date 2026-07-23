import "server-only";
import { connectDB } from "@/lib/db";
import { Booking } from "@/models";
import type { NotificationsResponse } from "@/types/admin";

const ITEM_LIMIT = 5;

/** Powers the topbar's notification bell: surfaces bookings still awaiting admin confirmation. */
export async function getAdminNotifications(): Promise<NotificationsResponse> {
  await connectDB();

  const [count, rows] = await Promise.all([
    Booking.countDocuments({ bookingStatus: "PENDING" }),
    Booking.find({ bookingStatus: "PENDING" })
      .sort({ createdAt: -1 })
      .limit(ITEM_LIMIT)
      .populate("userId", "firstName lastName")
      .populate("eventId", "title"),
  ]);

  return {
    count,
    items: rows.map((row) => {
      const user = row.userId as unknown as { firstName?: string; lastName?: string } | null;
      const event = row.eventId as unknown as { title?: string } | null;
      return {
        id: row._id.toString(),
        message: `${user?.firstName ?? "A customer"} ${user?.lastName ?? ""} is awaiting confirmation for "${event?.title ?? "an event"}".`,
        createdAt: row.createdAt.toISOString(),
      };
    }),
  };
}

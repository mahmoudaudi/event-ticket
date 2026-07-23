import "server-only";
import { connectDB } from "@/lib/db";
import { Booking, Event, User } from "@/models";
import type { AdminStats, RecentActivityItem } from "@/types/admin";

const DAY_MS = 24 * 60 * 60 * 1000;
export const DASHBOARD_RANGE_OPTIONS = [7, 30, 90] as const;
export type DashboardRangeDays = (typeof DASHBOARD_RANGE_OPTIONS)[number];
const DEFAULT_RANGE: DashboardRangeDays = 30;

/** Percent change from `previous` to `current`, safe against division by zero. */
function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

/**
 * Aggregates everything the admin dashboard overview needs: headline metrics
 * with period-over-period trends, a booking volume series for the selected
 * window, and a merged recent-activity feed. Shared by the `/admin` Server
 * Component page and the `/api/admin/stats` route (used for client-side
 * refreshes).
 *
 * @param windowDays Size of the reporting window in days (7, 30, or 90).
 *   Trend deltas compare this window against the equally-sized window
 *   immediately before it.
 */
export async function getDashboardStats(windowDays: DashboardRangeDays = DEFAULT_RANGE): Promise<AdminStats> {
  await connectDB();

  const now = new Date();
  const windowStart = new Date(now.getTime() - windowDays * DAY_MS);
  const priorWindowStart = new Date(now.getTime() - 2 * windowDays * DAY_MS);

  const [
    revenueThisWindow,
    revenuePriorWindow,
    activeEvents,
    eventsCreatedThisWindow,
    eventsCreatedPriorWindow,
    bookingsThisWindow,
    bookingsPriorWindow,
    totalBookings,
    newUsersThisWindow,
    newUsersPriorWindow,
    dailyBookings,
    recentBookings,
    recentUsers,
    recentEvents,
  ] = await Promise.all([
    Booking.aggregate([
      { $match: { paymentStatus: "PAID", createdAt: { $gte: windowStart } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Booking.aggregate([
      { $match: { paymentStatus: "PAID", createdAt: { $gte: priorWindowStart, $lt: windowStart } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Event.countDocuments({ status: "PUBLISHED" }),
    Event.countDocuments({ createdAt: { $gte: windowStart } }),
    Event.countDocuments({ createdAt: { $gte: priorWindowStart, $lt: windowStart } }),
    Booking.countDocuments({ createdAt: { $gte: windowStart } }),
    Booking.countDocuments({ createdAt: { $gte: priorWindowStart, $lt: windowStart } }),
    Booking.countDocuments({}),
    User.countDocuments({ role: "USER", createdAt: { $gte: windowStart } }),
    User.countDocuments({ role: "USER", createdAt: { $gte: priorWindowStart, $lt: windowStart } }),
    Booking.aggregate([
      { $match: { createdAt: { $gte: windowStart } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Booking.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "firstName lastName")
      .populate("eventId", "title"),
    User.find({ role: "USER" }).sort({ createdAt: -1 }).limit(3),
    Event.find({}).sort({ createdAt: -1 }).limit(3),
  ]);

  // Fill in zero-count days so the chart has a continuous x-axis for the selected window.
  const countsByDate = new Map<string, number>(dailyBookings.map((d) => [d._id, d.count]));
  const bookingTrends: AdminStats["bookingTrends"] = [];
  for (let i = windowDays - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * DAY_MS);
    const key = date.toISOString().slice(0, 10);
    const label = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
    bookingTrends.push({ date: label, count: countsByDate.get(key) ?? 0 });
  }

  // Merge the three recent-activity sources into a single feed, newest first.
  const activity: RecentActivityItem[] = [
    ...recentBookings.map((b) => {
      const user = b.userId as unknown as { firstName?: string; lastName?: string } | null;
      const event = b.eventId as unknown as { title?: string } | null;
      return {
        id: `booking-${b._id.toString()}`,
        type: "booking" as const,
        message: `New booking: ${user?.firstName ?? "A customer"} ${user?.lastName ?? ""} reserved "${event?.title ?? "an event"}".`,
        createdAt: b.createdAt.toISOString(),
      };
    }),
    ...recentUsers.map((u) => ({
      id: `user-${u._id.toString()}`,
      type: "user" as const,
      message: `User registered: ${u.firstName} ${u.lastName} joined Crescent Live.`,
      createdAt: u.createdAt.toISOString(),
    })),
    ...recentEvents.map((e) => ({
      id: `event-${e._id.toString()}`,
      type: "event" as const,
      message: `Event ${e.status === "DRAFT" ? "drafted" : "published"}: "${e.title}".`,
      createdAt: e.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return {
    totalRevenue: revenueThisWindow[0]?.total ?? 0,
    totalRevenueTrend: pctChange(revenueThisWindow[0]?.total ?? 0, revenuePriorWindow[0]?.total ?? 0),
    activeEvents,
    activeEventsTrend: pctChange(eventsCreatedThisWindow, eventsCreatedPriorWindow),
    totalBookings,
    totalBookingsTrend: pctChange(bookingsThisWindow, bookingsPriorWindow),
    newUsers: newUsersThisWindow,
    newUsersTrend: pctChange(newUsersThisWindow, newUsersPriorWindow),
    bookingTrends,
    recentActivity: activity,
  };
}

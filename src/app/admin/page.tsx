import Link from "next/link";
import { DollarSign, CalendarCheck, Ticket, UserPlus } from "lucide-react";
import { Topbar } from "@/components/admin/Topbar";
import { StatCard } from "@/components/admin/StatCard";
import { BookingTrendsChart } from "@/components/admin/BookingTrendsChart";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { DateRangeSelect } from "@/components/admin/DateRangeSelect";
import { Card } from "@/components/ui/Card";
import { getDashboardStats, DASHBOARD_RANGE_OPTIONS, type DashboardRangeDays } from "@/lib/admin/stats";
import { formatCurrency } from "@/lib/format";

export const metadata = { title: "Dashboard" };

// Always read fresh data — this page reports live operational metrics.
export const dynamic = "force-dynamic";

interface AdminDashboardPageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const { range: rangeParam } = await searchParams;
  const requestedRange = Number(rangeParam ?? "30");
  const range: DashboardRangeDays = (DASHBOARD_RANGE_OPTIONS as readonly number[]).includes(requestedRange)
    ? (requestedRange as DashboardRangeDays)
    : 30;

  const stats = await getDashboardStats(range);

  return (
    <>
      <Topbar title="Overview" subtitle="Welcome back. Here's what's happening today." />

      <div className="flex flex-col gap-6 p-8">
        <div className="flex justify-end">
          <DateRangeSelect />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            trend={stats.totalRevenueTrend}
          />
          <StatCard
            icon={CalendarCheck}
            label="Active Events"
            value={stats.activeEvents.toString()}
            trend={stats.activeEventsTrend}
          />
          <StatCard
            icon={Ticket}
            label="Total Bookings"
            value={stats.totalBookings.toLocaleString()}
            trend={stats.totalBookingsTrend}
          />
          <StatCard
            icon={UserPlus}
            label="New Users"
            value={stats.newUsers.toString()}
            trend={stats.newUsersTrend}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">Booking Trends</h2>
                <p className="text-sm text-ink-muted">Daily reservation volume for the selected period</p>
              </div>
            </div>
            <BookingTrendsChart data={stats.bookingTrends} />
          </Card>

          <Card>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">Recent Activity</h2>
              <Link href="/admin/activity" className="text-xs font-semibold text-brand hover:underline">
                View All Logs
              </Link>
            </div>
            <RecentActivity items={stats.recentActivity} />
          </Card>
        </div>
      </div>
    </>
  );
}

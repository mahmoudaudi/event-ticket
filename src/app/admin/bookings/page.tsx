import { Clock, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { Topbar } from "@/components/admin/Topbar";
import { MiniStatCard } from "@/components/admin/MiniStatCard";
import { BookingsTable } from "@/components/admin/BookingsTable";
import { getAdminBookingsList } from "@/lib/admin/bookings";

export const metadata = { title: "Bookings" };
export const dynamic = "force-dynamic";

interface AdminBookingsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminBookingsPage({ searchParams }: AdminBookingsPageProps) {
  const { status } = await searchParams;
  const initialData = await getAdminBookingsList({ page: 1, status });

  return (
    <>
      <Topbar title="Bookings Management" subtitle="Review and manage all platform reservations" />

      <div className="flex flex-col gap-6 p-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MiniStatCard icon={Clock} label="Pending Approval" value={initialData.summary.pendingCount.toString()} />
          <MiniStatCard
            icon={CheckCircle2}
            label="Confirmed Today"
            value={initialData.summary.confirmedTodayCount.toString()}
          />
          <MiniStatCard icon={XCircle} label="Cancellations" value={initialData.summary.cancelledCount.toString()} />
          <MiniStatCard
            icon={TrendingUp}
            label="Platform Growth"
            value={`${initialData.summary.growthTrend > 0 ? "+" : ""}${initialData.summary.growthTrend}%`}
          />
        </div>

        <BookingsTable initialData={initialData} initialStatus={status ?? "ALL"} />
      </div>
    </>
  );
}

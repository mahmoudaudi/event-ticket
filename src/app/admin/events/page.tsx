import { Rocket, FileText, DollarSign } from "lucide-react";
import { Topbar } from "@/components/admin/Topbar";
import { MiniStatCard } from "@/components/admin/MiniStatCard";
import { EventsTable } from "@/components/admin/EventsTable";
import { getAdminEventsList } from "@/lib/admin/events";
import { formatCurrency } from "@/lib/format";

export const metadata = { title: "Events" };
export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const initialData = await getAdminEventsList({ page: 1 });

  return (
    <>
      <Topbar title="Event Management" />

      <div className="flex flex-col gap-6 p-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <MiniStatCard icon={Rocket} label="Active Events" value={initialData.summary.activeCount.toString()} />
          <MiniStatCard icon={FileText} label="Drafts" value={initialData.summary.draftCount.toString()} />
          <MiniStatCard
            icon={DollarSign}
            label="Total Revenue"
            value={formatCurrency(initialData.summary.totalRevenue)}
          />
        </div>

        <EventsTable initialData={initialData} />
      </div>
    </>
  );
}

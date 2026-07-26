import { Topbar } from "@/components/admin/Topbar";
import { Card } from "@/components/ui/Card";
import { EventForm } from "@/components/admin/EventForm";
import { getCategories } from "@/lib/admin/events";

export const metadata = { title: "New Event" };
export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const categories = await getCategories();

  return (
    <>
      <Topbar title="New Event" subtitle="Ticket tiers can be added once the event is created." />
      <div className="p-4 sm:p-8">
        <Card className="max-w-2xl">
          <EventForm mode="create" categories={categories} />
        </Card>
      </div>
    </>
  );
}

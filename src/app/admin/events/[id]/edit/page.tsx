import { notFound } from "next/navigation";
import { Topbar } from "@/components/admin/Topbar";
import { Card } from "@/components/ui/Card";
import { EventForm } from "@/components/admin/EventForm";
import { TicketTypeManager } from "@/components/admin/TicketTypeManager";
import { getAdminEventDetail, getCategories } from "@/lib/admin/events";

export const metadata = { title: "Edit Event" };
export const dynamic = "force-dynamic";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const [event, categories] = await Promise.all([getAdminEventDetail(id), getCategories()]);

  if (!event) notFound();

  return (
    <>
      <Topbar title="Edit Event" subtitle={event.title} />
      <div className="flex flex-col gap-6 p-4 sm:p-8">
        <Card className="max-w-2xl">
          <h2 className="mb-5 font-display text-lg font-bold text-ink">Event details</h2>
          <EventForm mode="edit" eventId={event.id} categories={categories} initialData={event} />
        </Card>

        <Card className="max-w-2xl">
          <h2 className="mb-5 font-display text-lg font-bold text-ink">Ticket tiers</h2>
          <TicketTypeManager eventId={event.id} initialTicketTypes={event.ticketTypes} />
        </Card>
      </div>
    </>
  );
}

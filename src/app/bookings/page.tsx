import { TabBar } from "@/components/admin/TabBar";
import { BookingCard } from "@/components/site/BookingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { getUserBookings } from "@/lib/user/bookings";
import { requireUser } from "@/lib/guards";
import { Ticket } from "lucide-react";

export const metadata = { title: "My Bookings" };
export const dynamic = "force-dynamic";

const TABS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
];

interface BookingsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function MyBookingsPage({ searchParams }: BookingsPageProps) {
  const { tab: tabParam } = await searchParams;
  const tab = tabParam === "past" ? "past" : "upcoming";

  const session = await requireUser();
  const allBookings = session ? await getUserBookings(session.user.id) : [];
  const bookings = allBookings.filter((b) => (tab === "upcoming" ? b.isUpcoming : !b.isUpcoming));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">My Bookings</h1>
        <p className="mt-1 text-sm text-ink-muted">Your reservations and digital e-tickets, all in one place.</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface">
        <TabBar tabs={TABS} active={tab} hrefForTab={(value) => `/bookings?tab=${value}`} />
        <div className="p-5">
          {bookings.length === 0 ? (
            <EmptyState
              icon={Ticket}
              title={tab === "upcoming" ? "No upcoming bookings" : "No past bookings"}
              description={
                tab === "upcoming"
                  ? "Once you book a ticket, it'll show up here."
                  : "Bookings for events that have already happened will show up here."
              }
            />
          ) : (
            <div className="flex flex-col gap-4">
              {bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

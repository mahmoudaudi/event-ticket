import Link from "next/link";
import { Clock, CheckCircle2, XCircle, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Topbar } from "@/components/admin/Topbar";
import { TabBar } from "@/components/admin/TabBar";
import { MiniStatCard } from "@/components/admin/MiniStatCard";
import { BookingsTable } from "@/components/admin/BookingsTable";
import { AuditLogList } from "@/components/admin/AuditLogList";
import { PageLinkPagination } from "@/components/admin/PageLinkPagination";
import { Card } from "@/components/ui/Card";
import { getAdminBookingsList } from "@/lib/admin/bookings";
import { getBookingActivityList } from "@/lib/admin/activity";
import { getCalendarEvents } from "@/lib/admin/calendar";
import { buildMonthGrid } from "@/lib/calendarGrid";
import { cn } from "@/lib/cn";

export const metadata = { title: "Bookings" };
export const dynamic = "force-dynamic";

const TABS = [
  { value: "table", label: "Table" },
  { value: "calendar", label: "Calendar" },
  { value: "activity", label: "Activity" },
];

interface AdminBookingsPageProps {
  searchParams: Promise<{ view?: string; status?: string; month?: string; page?: string }>;
}

export default async function AdminBookingsPage({ searchParams }: AdminBookingsPageProps) {
  const { view: viewParam, status, month, page: pageParam } = await searchParams;
  const view = TABS.some((t) => t.value === viewParam) ? viewParam! : "table";

  const initialData = await getAdminBookingsList({ page: 1, status });

  return (
    <>
      <Topbar title="Bookings Management" subtitle="Review and manage all platform reservations" />

      <div className="flex flex-col gap-6 p-4 sm:p-8">
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

        <Card className="p-0">
          <TabBar
            tabs={TABS}
            active={view}
            hrefForTab={(value) => `/admin/bookings?view=${value}`}
          />

          {view === "table" && (
            <div className="p-5">
              <BookingsTable initialData={initialData} initialStatus={status ?? "ALL"} />
            </div>
          )}

          {view === "calendar" && <BookingsCalendarTab monthParam={month} />}

          {view === "activity" && <BookingsActivityTab page={Number(pageParam ?? "1")} />}
        </Card>
      </div>
    </>
  );
}

const WEEKDAY_LABELS = [
  { full: "Sun", short: "S" },
  { full: "Mon", short: "M" },
  { full: "Tue", short: "T" },
  { full: "Wed", short: "W" },
  { full: "Thu", short: "T" },
  { full: "Fri", short: "F" },
  { full: "Sat", short: "S" },
];
const STATUS_DOT: Record<string, string> = {
  DRAFT: "bg-gold",
  PUBLISHED: "bg-success",
  CANCELLED: "bg-danger",
};

function parseMonthParam(month: string | undefined): { year: number; month: number } {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    if (m >= 1 && m <= 12) return { year: y, month: m };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function monthParamFor(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

async function BookingsCalendarTab({ monthParam }: { monthParam?: string }) {
  const { year, month } = parseMonthParam(monthParam);
  const events = await getCalendarEvents(year, month);

  const eventsByDay = new Map<number, typeof events>();
  for (const event of events) {
    const list = eventsByDay.get(event.day) ?? [];
    list.push(event);
    eventsByDay.set(event.day, list);
  }

  const weeks = buildMonthGrid(year, month);
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(year, month - 1, 1)
  );
  const prev = addMonths(year, month, -1);
  const next = addMonths(year, month, 1);
  const now = new Date();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
        <h2 className="font-display text-lg font-bold text-ink">{monthLabel}</h2>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/bookings?view=calendar&month=${monthParamFor(prev.year, prev.month)}`}
            aria-label="Previous month"
            className="rounded-lg border border-border p-1.5 text-ink-muted hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <Link
            href={`/admin/bookings?view=calendar&month=${monthParamFor(now.getFullYear(), now.getMonth() + 1)}`}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ink-muted hover:text-ink"
          >
            Today
          </Link>
          <Link
            href={`/admin/bookings?view=calendar&month=${monthParamFor(next.year, next.month)}`}
            aria-label="Next month"
            className="rounded-lg border border-border p-1.5 text-ink-muted hover:text-ink"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border text-center text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label.full} className="py-2">
            <span className="sm:hidden">{label.short}</span>
            <span className="hidden sm:inline">{label.full}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {weeks.flatMap((week) =>
          week.map((cell) => {
            const dayEvents = cell.isCurrentMonth ? (eventsByDay.get(cell.dayOfMonth) ?? []) : [];
            const visible = dayEvents.slice(0, 3);
            const overflow = dayEvents.length - visible.length;

            return (
              <div
                key={cell.date.toISOString()}
                className={cn(
                  "flex min-h-16 flex-col gap-1 border-b border-r border-border p-1 sm:min-h-28 sm:p-2",
                  !cell.isCurrentMonth && "bg-cream-alt/40"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                    cell.isToday ? "bg-brand text-ink-inverse" : cell.isCurrentMonth ? "text-ink" : "text-ink-muted"
                  )}
                >
                  {cell.dayOfMonth}
                </span>
                <div className="flex flex-col gap-1">
                  {visible.map((event) => (
                    <Link
                      key={event.id}
                      href={`/admin/events/${event.id}/edit`}
                      className="flex items-center gap-1.5 truncate rounded-md bg-cream-alt px-1.5 py-1 text-xs text-ink hover:bg-brand-soft"
                      title={`${event.title} — ${event.bookingCount} booking${event.bookingCount === 1 ? "" : "s"}`}
                    >
                      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[event.status])} />
                      <span className="truncate">{event.title}</span>
                    </Link>
                  ))}
                  {overflow > 0 && <span className="px-1.5 text-xs text-ink-muted">+{overflow} more</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center gap-4 border-t border-border px-6 py-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> Published
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Draft
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-danger" /> Cancelled
        </span>
      </div>
    </div>
  );
}

async function BookingsActivityTab({ page }: { page: number }) {
  const data = await getBookingActivityList(page);
  return (
    <>
      <AuditLogList
        items={data.items}
        emptyMessage="No booking activity yet. Confirming or cancelling a booking will show up here."
      />
      {data.items.length > 0 && (
        <PageLinkPagination
          hrefForPage={(p) => `/admin/bookings?view=activity&page=${p}`}
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          label="actions"
        />
      )}
    </>
  );
}

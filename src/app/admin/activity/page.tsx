import Link from "next/link";
import { ChevronLeft, ChevronRight, ShieldCheck, ShieldX, UserCog } from "lucide-react";
import { Topbar } from "@/components/admin/Topbar";
import { Card } from "@/components/ui/Card";
import { getAdminActivityList, type AdminActivityAction } from "@/lib/admin/activity";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";

export const metadata = { title: "Activity Log" };
export const dynamic = "force-dynamic";

const ACTION_ICON: Record<AdminActivityAction, typeof ShieldCheck> = {
  BOOKING_CONFIRMED: ShieldCheck,
  BOOKING_CANCELLED: ShieldX,
  USER_ROLE_CHANGED: UserCog,
  USER_SUSPENDED: ShieldX,
  USER_REACTIVATED: ShieldCheck,
};

const ACTION_STYLE: Record<AdminActivityAction, string> = {
  BOOKING_CONFIRMED: "bg-success-soft text-success",
  BOOKING_CANCELLED: "bg-danger-soft text-danger",
  USER_ROLE_CHANGED: "bg-info-soft text-info",
  USER_SUSPENDED: "bg-danger-soft text-danger",
  USER_REACTIVATED: "bg-success-soft text-success",
};

interface ActivityPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminActivityPage({ searchParams }: ActivityPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam ?? "1");
  const data = await getAdminActivityList(page);

  return (
    <>
      <Topbar title="Activity Log" subtitle="A record of every admin action taken on the platform" />
      <div className="flex flex-col gap-6 p-8">
        <Card className="p-0">
          {data.items.length === 0 ? (
            <p className="p-8 text-center text-sm text-ink-muted">
              No admin activity recorded yet. Actions like confirming a booking or changing a user&apos;s role will show up here.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {data.items.map((item) => {
                const Icon = ACTION_ICON[item.action];
                return (
                  <li key={item.id} className="flex items-start gap-3 px-6 py-4">
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        ACTION_STYLE[item.action]
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm text-ink">{item.message}</p>
                      <p className="mt-0.5 text-xs text-ink-muted">{formatDateTime(item.createdAt)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex items-center justify-between border-t border-border px-6 py-4 text-sm text-ink-muted">
            <span>
              Page {data.page} of {data.totalPages} · {data.total} total actions
            </span>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/activity?page=${Math.max(1, page - 1)}`}
                aria-disabled={page <= 1}
                className={cn(
                  "rounded-lg border border-border p-1.5",
                  page <= 1 && "pointer-events-none opacity-40"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <Link
                href={`/admin/activity?page=${Math.min(data.totalPages, page + 1)}`}
                aria-disabled={page >= data.totalPages}
                className={cn(
                  "rounded-lg border border-border p-1.5",
                  page >= data.totalPages && "pointer-events-none opacity-40"
                )}
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

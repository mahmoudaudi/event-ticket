import { CalendarPlus, ShieldAlert, Ticket, UserPlus } from "lucide-react";
import type { RecentActivityItem, RecentActivityType } from "@/types/admin";
import { cn } from "@/lib/cn";

const ICONS: Record<RecentActivityType, typeof Ticket> = {
  booking: Ticket,
  user: UserPlus,
  event: CalendarPlus,
  payment_failed: ShieldAlert,
};

const ICON_STYLES: Record<RecentActivityType, string> = {
  booking: "bg-info-soft text-info",
  user: "bg-gold-soft text-gold",
  event: "bg-success-soft text-success",
  payment_failed: "bg-danger-soft text-danger",
};

/** Relative time label, e.g. "2 mins ago", "3 hours ago". */
function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

interface RecentActivityProps {
  items: RecentActivityItem[];
}

export function RecentActivity({ items }: RecentActivityProps) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-muted">No recent activity yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-5">
      {items.map((item) => {
        const Icon = ICONS[item.type];
        return (
          <li key={item.id} className="flex items-start gap-3">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                ICON_STYLES[item.type]
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm text-ink">{item.message}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{timeAgo(item.createdAt)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

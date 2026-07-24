import { ShieldCheck, ShieldX, UserCog } from "lucide-react";
import type { AdminActivityAction } from "@/lib/admin/activity";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";

interface AuditLogItem {
  id: string;
  message: string;
  action: AdminActivityAction;
  createdAt: string;
}

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

interface AuditLogListProps {
  items: AuditLogItem[];
  emptyMessage: string;
}

/** Renders a list of admin audit-log entries with a per-action icon and color. */
export function AuditLogList({ items, emptyMessage }: AuditLogListProps) {
  if (items.length === 0) {
    return <p className="p-6 sm:p-8 text-center text-sm text-ink-muted">{emptyMessage}</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((item) => {
        const Icon = ACTION_ICON[item.action];
        return (
          <li key={item.id} className="flex items-start gap-3 px-6 py-4">
            <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", ACTION_STYLE[item.action])}>
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
  );
}

import { Badge, type BadgeVariant } from "@/components/ui/Badge";

type StatusMap = Record<string, { label: string; variant: BadgeVariant }>;

const EVENT_STATUS: StatusMap = {
  DRAFT: { label: "Draft", variant: "gold" },
  PUBLISHED: { label: "Active", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "danger" },
};

const BOOKING_STATUS: StatusMap = {
  PENDING: { label: "Pending", variant: "warning" },
  CONFIRMED: { label: "Confirmed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "danger" },
};

const PAYMENT_STATUS: StatusMap = {
  PENDING: { label: "Pending", variant: "warning" },
  PAID: { label: "Paid", variant: "success" },
  FAILED: { label: "Failed", variant: "danger" },
};

interface StatusBadgeProps {
  status: string;
  kind: "event" | "booking" | "payment";
}

/** Renders the right badge color/label for an Event, Booking, or Payment status enum. */
export function StatusBadge({ status, kind }: StatusBadgeProps) {
  const map = kind === "event" ? EVENT_STATUS : kind === "booking" ? BOOKING_STATUS : PAYMENT_STATUS;
  const entry = map[status] ?? { label: status, variant: "neutral" as BadgeVariant };
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}

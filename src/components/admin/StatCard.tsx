import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatTrend } from "@/lib/format";
import { cn } from "@/lib/cn";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend: number;
}

/** One of the four headline metric cards at the top of the admin dashboard. */
export function StatCard({ icon: Icon, label, value, trend }: StatCardProps) {
  const isPositive = trend >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand">
          <Icon className="h-5 w-5" />
        </div>
        <span
          className={cn(
            "flex items-center gap-1 text-xs font-semibold",
            isPositive ? "text-success" : "text-danger"
          )}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          {formatTrend(trend)}
        </span>
      </div>
      <div>
        <p className="text-sm text-ink-muted">{label}</p>
        <p className="font-display text-2xl font-bold text-ink">{value}</p>
      </div>
    </Card>
  );
}

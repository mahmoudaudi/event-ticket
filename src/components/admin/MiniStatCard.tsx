import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface MiniStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

/** Compact metric card with an icon, label, and value — no trend line. */
export function MiniStatCard({ icon: Icon, label, value }: MiniStatCardProps) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-soft text-brand">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-ink-muted">{label}</p>
        <p className="font-display text-xl font-bold text-ink">{value}</p>
      </div>
    </Card>
  );
}

import { GlobalSearch } from "@/components/admin/GlobalSearch";
import { NotificationsBell } from "@/components/admin/NotificationsBell";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

/** Page header bar shown at the top of every /admin page. */
export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-8 py-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <GlobalSearch />
        <NotificationsBell />
      </div>
    </header>
  );
}

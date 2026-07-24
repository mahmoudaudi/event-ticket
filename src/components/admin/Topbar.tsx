import { MobileMenuButton } from "@/components/admin/MobileMenuButton";
import { GlobalSearch } from "@/components/admin/GlobalSearch";
import { NotificationsBell } from "@/components/admin/NotificationsBell";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

/** Page header bar shown at the top of every /admin page. Wraps to a second row on narrow screens. */
export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-4 py-4 sm:px-8 sm:py-6">
      <div className="flex items-center gap-3">
        <MobileMenuButton />
        <div>
          <h1 className="font-display text-xl font-bold text-ink sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
        </div>
      </div>
      <div className="flex flex-1 items-center justify-end gap-3 sm:flex-none">
        <GlobalSearch />
        <NotificationsBell />
      </div>
    </header>
  );
}

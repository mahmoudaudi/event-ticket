import Link from "next/link";
import { cn } from "@/lib/cn";

interface Tab {
  value: string;
  label: string;
}

interface LogsTabBarProps {
  tabs: Tab[];
  active: string;
}

/** Server-rendered tab bar — switching tabs is a real navigation (?tab=...), no client JS needed. */
export function LogsTabBar({ tabs, active }: LogsTabBarProps) {
  return (
    <div className="flex gap-1 border-b border-border px-6">
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          href={`/admin/logs?tab=${tab.value}`}
          className={cn(
            "border-b-2 px-4 py-3 text-sm font-semibold",
            active === tab.value
              ? "border-brand text-brand"
              : "border-transparent text-ink-muted hover:text-ink"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

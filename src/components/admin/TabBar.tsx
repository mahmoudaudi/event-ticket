import Link from "next/link";
import { cn } from "@/lib/cn";

interface Tab {
  value: string;
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  active: string;
  hrefForTab: (value: string) => string;
}

/** Server-rendered tab bar — switching tabs is a real navigation, no client JS needed. */
export function TabBar({ tabs, active, hrefForTab }: TabBarProps) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border px-4 sm:px-6">
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          href={hrefForTab(tab.value)}
          className={cn(
            "shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold sm:px-4",
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

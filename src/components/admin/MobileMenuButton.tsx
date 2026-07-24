"use client";

import { Menu } from "lucide-react";
import { useMobileSidebar } from "@/components/admin/MobileSidebarContext";

/** Mobile-only hamburger button that opens the sidebar drawer. Hidden at the lg breakpoint and up. */
export function MobileMenuButton() {
  const { toggle } = useMobileSidebar();

  return (
    <button
      onClick={toggle}
      aria-label="Open menu"
      className="rounded-lg border border-border bg-surface p-2.5 text-ink-muted hover:text-ink lg:hidden"
    >
      <Menu className="h-4.5 w-4.5" />
    </button>
  );
}

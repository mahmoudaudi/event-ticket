"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface MobileSidebarContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const MobileSidebarContext = createContext<MobileSidebarContextValue | null>(null);

/** Reads/controls whether the mobile sidebar drawer is open. Must be used under <MobileSidebarProvider>. */
export function useMobileSidebar(): MobileSidebarContextValue {
  const ctx = useContext(MobileSidebarContext);
  if (!ctx) throw new Error("useMobileSidebar must be used within <MobileSidebarProvider>");
  return ctx;
}

/** Wraps the whole /admin shell so the Sidebar (drawer) and Topbar (hamburger button) share one open/close state. */
export function MobileSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const value: MobileSidebarContextValue = {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };

  return <MobileSidebarContext.Provider value={value}>{children}</MobileSidebarContext.Provider>;
}

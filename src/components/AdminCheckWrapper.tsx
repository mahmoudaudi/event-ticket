"use client";

import { usePathname } from "next/navigation";
import ChatWidgetWrapper from "@/components/ChatWidgetWrapper";

const HIDDEN_PATHS = ["/admin", "/login", "/signup", "/forgot-password", "/reset-password", "/verify-otp"];

export default function AdminCheckWrapper() {
  const pathname = usePathname();
  if (HIDDEN_PATHS.some((p) => pathname?.startsWith(p))) return null;
  return <ChatWidgetWrapper />;
}

"use client";

import { usePathname } from "next/navigation";
import ChatWidgetWrapper from "@/components/ChatWidgetWrapper";

export default function AdminCheckWrapper() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <ChatWidgetWrapper />;
}

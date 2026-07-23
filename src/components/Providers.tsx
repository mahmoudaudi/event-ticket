"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/Toast";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}

"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type ToastType = "success" | "error" | "info";
type ToastVariant = "default" | "auth";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  variant: ToastVariant;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", variant: ToastVariant = "default") => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, type, variant }]);
      if (variant === "default") {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
      }
    },
    []
  );

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts
          .filter((t) => t.variant === "default")
          .map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const colors = {
    success: { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600", text: "text-green-800" },
    error: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600", text: "text-red-800" },
    info: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600", text: "text-amber-800" },
  };

  const icons: Record<ToastType, string> = {
    success: "check_circle",
    error: "error",
    info: "info",
  };

  const c = colors[toast.type];

  return (
    <div
      className={`pointer-events-auto flex items-start gap-2.5 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md ${c.bg} ${c.border} animate-slide-in-right max-w-sm`}
    >
      <span className={`material-symbols-outlined text-lg shrink-0 ${c.icon}`}>
        {icons[toast.type]}
      </span>
      <p className={`text-sm leading-snug ${c.text}`}>{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className={`ml-auto shrink-0 ${c.icon} hover:opacity-70 transition-opacity cursor-pointer`}>
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
}

export function AuthAlert({ message, type }: { message: string; type?: ToastType }) {
  const colors = {
    success: { bg: "bg-green-50/90", border: "border-green-200", icon: "text-green-600", text: "text-green-700" },
    error: { bg: "bg-red-50/90", border: "border-red-200", icon: "text-red-600", text: "text-red-700" },
    info: { bg: "bg-amber-50/90", border: "border-amber-200", icon: "text-amber-600", text: "text-amber-700" },
  };

  const icons: Record<string, string> = {
    success: "check_circle",
    error: "error",
    info: "info",
  };

  const c = colors[type || "info"];

  return (
    <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg border backdrop-blur-sm ${c.bg} ${c.border} animate-fade-in`}>
      <span className={`material-symbols-outlined text-base shrink-0 ${c.icon}`}>
        {icons[type || "info"]}
      </span>
      <p className={`text-xs leading-snug ${c.text}`}>{message}</p>
    </div>
  );
}

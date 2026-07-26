"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  /** Show a green success toast. */
  success: (message: string) => void;
  /** Show a red error toast. */
  error: (message: string) => void;
  /** Show a neutral informational toast. */
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const AUTO_DISMISS_MS = 4500;

/**
 * Fires toast notifications from any Client Component.
 *
 * @example
 * const toast = useToast();
 * toast.success("Event created.");
 * toast.error("Couldn't delete that booking.");
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

/** Provides the toast context and renders the fixed-position toast stack. Mount once, near the app root. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss]
  );

  const value: ToastContextValue = {
    success: (message) => show(message, "success"),
    error: (message) => show(message, "error"),
    info: (message) => show(message, "info"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const VARIANT_CONFIG: Record<ToastVariant, { icon: typeof CheckCircle2; iconClass: string; borderClass: string }> = {
  success: { icon: CheckCircle2, iconClass: "text-success", borderClass: "border-l-success" },
  error: { icon: AlertCircle, iconClass: "text-danger", borderClass: "border-l-danger" },
  info: { icon: Info, iconClass: "text-info", borderClass: "border-l-info" },
};

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  // Mount in the "hidden" position first, then transition in on the next frame.
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const { icon: Icon, iconClass, borderClass } = VARIANT_CONFIG[toast.variant];

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-xl border border-l-4 border-border bg-surface px-4 py-3 shadow-lg transition-all duration-300",
        borderClass,
        entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconClass)} />
      <p className="flex-1 text-sm font-medium text-ink">{toast.message}</p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-ink-muted hover:text-ink"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

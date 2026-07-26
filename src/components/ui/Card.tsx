import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** White surface card with the app's standard border/radius/padding. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-6 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

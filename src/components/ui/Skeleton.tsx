import { cn } from "@/lib/cn";

/** Pulsing placeholder block used to build loading skeletons. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-cream-alt", className)} />;
}

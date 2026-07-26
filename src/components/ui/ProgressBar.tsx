import { cn } from "@/lib/cn";

interface ProgressBarProps {
  /** 0-100 */
  value: number;
  className?: string;
}

/** Slim horizontal progress bar used to show ticket sell-through / capacity. */
export function ProgressBar({ value, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-cream-alt", className)}>
      <div
        className="h-full rounded-full bg-brand transition-[width]"
        style={{ width: `${clamped}%` }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}

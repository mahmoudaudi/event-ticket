import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

interface TablePageSkeletonProps {
  statCardCount?: number;
  rowCount?: number;
}

/** Shared loading skeleton for the Events/Bookings/Users admin list pages. */
export function TablePageSkeleton({ statCardCount = 0, rowCount = 6 }: TablePageSkeletonProps) {
  return (
    <>
      <div className="border-b border-border px-4 py-4 sm:px-8 sm:py-6">
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="flex flex-col gap-6 p-4 sm:p-8">
        {statCardCount > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: statCardCount }).map((_, i) => (
              <Card key={i} className="flex items-center gap-4">
                <Skeleton className="h-11 w-11 rounded-lg" />
                <div>
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="mt-2 h-6 w-14" />
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border p-5">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-56" />
          </div>
          <div className="flex flex-col gap-4 p-5">
            {Array.from({ length: rowCount }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

export default function AdminLogsLoading() {
  return (
    <>
      <div className="border-b border-border px-4 py-4 sm:px-8 sm:py-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <div className="flex flex-col gap-6 p-4 sm:p-8">
        <Card className="p-0">
          <div className="flex gap-6 border-b border-border px-6 py-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="flex flex-col gap-4 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

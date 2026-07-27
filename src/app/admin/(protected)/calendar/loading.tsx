import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

export default function AdminCalendarLoading() {
  return (
    <>
      <div className="border-b border-border px-8 py-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="flex flex-col gap-6 p-8">
        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="grid grid-cols-7 gap-px">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-none" />
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

export default function AdminDashboardLoading() {
  return (
    <>
      <div className="border-b border-border px-4 py-4 sm:px-8 sm:py-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>

      <div className="flex flex-col gap-6 p-4 sm:p-8">
        <div className="flex justify-end">
          <Skeleton className="h-11 w-40" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="mt-2 h-7 w-24" />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-2 h-4 w-56" />
            <Skeleton className="mt-6 h-64 w-full" />
          </Card>
          <Card>
            <Skeleton className="h-5 w-32" />
            <div className="mt-5 flex flex-col gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="mt-1.5 h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

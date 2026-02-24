import { Skeleton } from "@/components/ui/skeleton";

export function DashboardOverviewSkeleton() {
  return (
    <div className="w-full h-[50vh] rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Chart area */}
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-64 w-64 rounded-full bg-white/10" />
        </div>
        {/* Stats area */}
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-48 bg-white/10" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32 bg-white/10" />
                <Skeleton className="h-4 w-24 bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BudgetProgressSkeleton() {
  return (
    <div className="w-full h-[25vh] rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-40 bg-white/10" />
        <Skeleton className="h-4 w-full bg-white/10" />
        <div className="flex gap-4 mt-4">
          <Skeleton className="h-16 flex-1 rounded-lg bg-white/10" />
          <Skeleton className="h-16 flex-1 rounded-lg bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export function QuickStatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-[15vh] rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 p-4"
        >
          <div className="space-y-3">
            <Skeleton className="h-5 w-32 bg-white/10" />
            <Skeleton className="h-8 w-24 bg-white/10" />
            <Skeleton className="h-3 w-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

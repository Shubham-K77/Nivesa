import { Skeleton } from "@/components/ui/skeleton";

export function PredictionChartSkeleton() {
  return (
    <div className="w-full h-[60vh] rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
      <div className="space-y-6 h-full">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-white/10" />
          <Skeleton className="h-4 w-full max-w-md bg-white/10" />
        </div>
        {/* Chart Area */}
        <div className="flex-1 flex items-end gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1 bg-white/10 rounded-t"
              style={{ height: `${Math.random() * 60 + 20}%` }}
            />
          ))}
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32 bg-white/10" />
              <Skeleton className="h-6 w-24 bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export function TransactionTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-5 gap-4 p-4 border-b border-white/10">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-4 w-full bg-white/10" />
        ))}
      </div>
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-5 gap-4 p-4 border-b border-white/5 last:border-0"
        >
          {[1, 2, 3, 4, 5].map((j) => (
            <Skeleton key={j} className="h-4 w-full bg-white/10" />
          ))}
        </div>
      ))}
    </div>
  );
}

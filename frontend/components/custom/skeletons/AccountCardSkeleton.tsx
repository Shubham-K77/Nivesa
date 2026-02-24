import { Skeleton } from "@/components/ui/skeleton";

export function AccountCardSkeleton() {
  return (
    <div className="w-full p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32 bg-white/10" />
          <Skeleton className="h-4 w-24 bg-white/10" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-8 w-40 bg-white/10" />
        <Skeleton className="h-3 w-full bg-white/10" />
      </div>
    </div>
  );
}

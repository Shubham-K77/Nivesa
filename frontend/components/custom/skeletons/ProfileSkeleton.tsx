import { Skeleton } from "@/components/ui/skeleton";

export function ProfileHeaderSkeleton() {
  return (
    <div className="w-full rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Avatar */}
        <Skeleton className="h-32 w-32 rounded-full bg-white/10" />
        {/* User Info */}
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-48 bg-white/10" />
          <Skeleton className="h-5 w-64 bg-white/10" />
          <Skeleton className="h-4 w-56 bg-white/10" />
        </div>
        {/* Action Button */}
        <Skeleton className="h-10 w-32 rounded-lg bg-white/10" />
      </div>
    </div>
  );
}

export function ProfileFormSkeleton() {
  return (
    <div className="w-full space-y-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24 bg-white/10" />
          <Skeleton className="h-10 w-full rounded-lg bg-white/10" />
        </div>
      ))}
      <div className="flex gap-4 pt-4">
        <Skeleton className="h-10 w-32 rounded-lg bg-white/10" />
        <Skeleton className="h-10 w-32 rounded-lg bg-white/10" />
      </div>
    </div>
  );
}

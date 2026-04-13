import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <Skeleton className="h-7 w-48" />

      {/* Hero stat card */}
      <Skeleton className="h-36 w-full rounded-[var(--radius-xl)]" />

      {/* Stats grid — 2x4 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-[var(--radius-lg)]" />
        ))}
      </div>

      {/* Recent sessions */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-36" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-[var(--radius-lg)]" />
        ))}
      </div>
    </div>
  );
}

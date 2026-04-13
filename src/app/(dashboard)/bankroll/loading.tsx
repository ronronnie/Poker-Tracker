import { Skeleton } from "@/components/ui/skeleton";

export default function BankrollLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-[var(--radius-md)]" />
          <Skeleton className="h-9 w-28 rounded-[var(--radius-md)]" />
        </div>
      </div>

      {/* Summary strip — 4 stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-[var(--radius-lg)]" />
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-[var(--radius-md)]" />
        <Skeleton className="h-9 w-32 rounded-[var(--radius-md)]" />
        <Skeleton className="h-9 w-32 rounded-[var(--radius-md)]" />
      </div>

      {/* Sessions list */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-[var(--radius-lg)]" />
      ))}
    </div>
  );
}

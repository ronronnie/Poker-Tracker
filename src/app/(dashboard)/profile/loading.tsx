import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="max-w-xl mx-auto flex flex-col gap-5">
      {/* Profile card */}
      <div
        className="rounded-[var(--radius-xl)] p-5 sm:p-6"
        style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)" }}
      >
        <div className="flex items-start gap-4">
          <Skeleton className="w-16 h-16 rounded-full shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="w-16 h-8 rounded-[var(--radius-md)]" />
        </div>
      </div>

      {/* Stats section label */}
      <Skeleton className="h-3 w-24" />

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-[var(--radius-lg)]" />
        ))}
      </div>

      {/* Groups section label */}
      <Skeleton className="h-3 w-24" />

      {/* Group rows */}
      <div
        className="rounded-[var(--radius-lg)] overflow-hidden"
        style={{ border: "1px solid var(--color-border)" }}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-none" style={{ borderTop: i > 0 ? "1px solid var(--color-border)" : "none" }} />
        ))}
      </div>

      {/* Account section */}
      <Skeleton className="h-3 w-20" />
      <div
        className="rounded-[var(--radius-lg)] overflow-hidden"
        style={{ border: "1px solid var(--color-border)" }}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-none" style={{ borderTop: i > 0 ? "1px solid var(--color-border)" : "none" }} />
        ))}
      </div>
    </div>
  );
}

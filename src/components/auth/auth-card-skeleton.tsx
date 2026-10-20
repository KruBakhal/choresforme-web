import { Skeleton } from "@/components/ui/skeleton";
import { STATE_COPY } from "@/lib/constants";

type AuthCardSkeletonProps = {
  /** Number of field-height bars. */
  rows?: number;
};

/** Placeholder card while the auth page waits for the session to load. */
export function AuthCardSkeleton({ rows = 4 }: AuthCardSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      className="mx-auto w-full md:max-w-xl md:rounded-lg md:border md:border-border md:bg-surface md:p-8 lg:mx-0 lg:w-1/2 lg:max-w-none xl:p-12"
    >
      <span className="sr-only">{STATE_COPY.loading}</span>
      <div aria-hidden className="flex flex-col">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-4 h-4 w-1/2" />
        <div className="mt-8 flex flex-col gap-6">
          {Array.from({ length: rows }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

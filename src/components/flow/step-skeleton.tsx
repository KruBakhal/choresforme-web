import { Skeleton } from "@/components/ui/skeleton";
import { STATE_COPY } from "@/lib/constants";
import { cn } from "@/lib/utils";

/* Static map: a computed `grid-cols-${n}` class would not be generated. */
const SEGMENT_COLS = {
  4: "grid-cols-4",
  5: "grid-cols-5",
  8: "grid-cols-8",
} as const;

type StepSkeletonProps = {
  segments?: keyof typeof SEGMENT_COLS;
  /**
   * T9: the panel comes first in the DOM (above the form below `lg`, taller
   * from `md`), as in a `StepLayout` with `summaryFirst`.
   */
  asideFirst?: boolean;
};

/**
 * Placeholder for a flow step (T6; reused by T7 and T9): the Suspense
 * fallback, the view before the stores hydrate and the view while a step
 * guard redirects. It mirrors the step layout so nothing jumps.
 */
export function StepSkeleton({ segments = 8, asideFirst = false }: StepSkeletonProps) {
  const main = (
    <div
      className={cn(
        "flex flex-col gap-6 lg:col-span-8 xl:col-span-7",
        asideFirst && "lg:col-start-1 lg:row-start-1",
      )}
    >
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
  const aside = asideFirst ? (
    <Skeleton className="h-14 w-full rounded-lg md:h-80 lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1" />
  ) : (
    <Skeleton className="h-14 w-full rounded-lg lg:col-span-4 lg:row-span-2 lg:h-80 xl:col-start-9" />
  );

  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{STATE_COPY.loading}</span>
      <div aria-hidden>
        <Skeleton className="h-4 w-1/4" />
        <div className={cn("mt-3 grid gap-1", SEGMENT_COLS[segments])}>
          {Array.from({ length: segments }, (_, i) => (
            <Skeleton key={i} className="h-2 rounded-full" />
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-8 lg:mt-12 lg:grid lg:grid-cols-12 lg:gap-8">
          {asideFirst ? aside : main}
          {asideFirst ? main : aside}
          <div
            className={cn(
              "flex justify-between gap-3 lg:col-span-8 xl:col-span-7",
              asideFirst && "lg:col-start-1 lg:row-start-2",
            )}
          >
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

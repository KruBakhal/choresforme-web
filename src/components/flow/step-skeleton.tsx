import { Skeleton } from "@/components/ui/skeleton";
import { STATE_COPY } from "@/lib/constants";

/**
 * Placeholder for a flow step (T6; reused by T7 and T9): the Suspense
 * fallback, the view before the stores hydrate and the view while a step
 * guard redirects. It mirrors the step layout so nothing jumps.
 */
export function StepSkeleton({ segments = 8 }: { segments?: 5 | 8 }) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{STATE_COPY.loading}</span>
      <div aria-hidden>
        <Skeleton className="h-4 w-1/4" />
        <div
          className={segments === 5 ? "mt-3 grid grid-cols-5 gap-1" : "mt-3 grid grid-cols-8 gap-1"}
        >
          {Array.from({ length: segments }, (_, i) => (
            <Skeleton key={i} className="h-2 rounded-full" />
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-8 lg:mt-12 lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-6 lg:col-span-8 xl:col-span-7">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <Skeleton className="h-14 w-full rounded-lg lg:col-span-4 lg:row-span-2 lg:h-80 xl:col-start-9" />
          <div className="flex justify-between gap-3 lg:col-span-8 xl:col-span-7">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

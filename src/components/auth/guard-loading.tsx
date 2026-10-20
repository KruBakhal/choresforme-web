import { LoadingState } from "@/components/states/loading-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_COPY } from "@/lib/constants";

/** Placeholder inside the role shell while the guard checks the session (never protected content). */
export function GuardLoading() {
  return (
    <div>
      <Skeleton aria-hidden className="mb-6 h-8 w-1/3" />
      <LoadingState variant="cards" count={2} label={AUTH_COPY.guard.checking} />
    </div>
  );
}

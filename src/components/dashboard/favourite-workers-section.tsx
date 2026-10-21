"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { CircleCheck, Heart, HeartOff } from "lucide-react";

import { FieldError } from "@/components/forms/form-field";
import { WorkerCard } from "@/components/job/worker-card";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { DASHBOARD_COPY } from "@/lib/constants";
import { workerDisplayName } from "@/lib/job-builder";
import { favourites as favouriteService } from "@/lib/mock/services";
import type { WorkerSummary } from "@/lib/types";

export type FavouritesState =
  | { status: "loading" }
  | { status: "error"; retrying: boolean }
  | { status: "ready"; workers: WorkerSummary[] };

type FavouriteWorkersSectionProps = {
  userId: string;
  state: FavouritesState;
  onRetry: () => void;
  onRemoved: (workerId: string) => void;
};

const COPY = DASHBOARD_COPY.account;
const TITLE_ID = "favourites-title";
const inCard = "border-0 px-0 py-8 md:px-0 md:py-8";
const removeButtonId = (workerId: string) => `favourite-remove-${workerId}`;

/**
 * Account → Favourite Workers (T8 open question 10): display cards with
 * "Remove". A removal needs no confirmation; focus moves to the next card's
 * Remove, else the previous one, else the heading.
 */
export function FavouriteWorkersSection({
  userId,
  state,
  onRetry,
  onRemoved,
}: FavouriteWorkersSectionProps) {
  const [removingId, setRemovingId] = React.useState<string | null>(null);
  const [failedId, setFailedId] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);

  async function remove(worker: WorkerSummary, list: WorkerSummary[]) {
    if (removingId) return;
    setRemovingId(worker.id);
    setFailedId(null);
    setStatus(null);
    try {
      const stillFavourite = await favouriteService.toggle(userId, worker.id);
      if (stillFavourite) {
        // It wasn't a favourite any more (changed elsewhere): undo the add.
        await favouriteService.toggle(userId, worker.id);
      }
      const index = list.findIndex((item) => item.id === worker.id);
      const next = list[index + 1] ?? list[index - 1];
      flushSync(() => {
        setRemovingId(null);
        onRemoved(worker.id);
        setStatus(DASHBOARD_COPY.favourite.removed(workerDisplayName(worker)));
      });
      (next
        ? document.getElementById(removeButtonId(next.id))
        : document.getElementById(TITLE_ID)
      )?.focus();
    } catch {
      flushSync(() => {
        setRemovingId(null);
        setFailedId(worker.id);
      });
      document.getElementById(removeButtonId(worker.id))?.focus();
    }
  }

  return (
    <section
      id="favourites"
      aria-labelledby={TITLE_ID}
      className="rounded-lg border border-border bg-surface p-4 md:p-6"
    >
      <h2
        id={TITLE_ID}
        tabIndex={-1}
        className="text-h4 font-semibold text-ink outline-none focus-visible:outline-2"
      >
        {COPY.favouritesTitle}
      </h2>
      <p className="mt-1 text-body-sm text-ink-muted">{COPY.favouritesHint}</p>
      <p role="status" className="mt-4 flex items-start gap-2 text-body-sm text-ink empty:hidden">
        {status && (
          <>
            <CircleCheck className="size-4 shrink-0 text-success" aria-hidden />
            {status}
          </>
        )}
      </p>

      {state.status === "loading" && (
        <LoadingState variant="rows" count={2} label={COPY.favouritesLoading} className="mt-4" />
      )}
      {state.status === "error" && (
        <ErrorState
          headingLevel={3}
          className={inCard}
          isRetrying={state.retrying}
          onRetry={onRetry}
        />
      )}
      {state.status === "ready" && state.workers.length === 0 && (
        <EmptyState
          headingLevel={3}
          icon={Heart}
          className={inCard}
          title={COPY.favouritesEmpty}
          description={COPY.favouritesEmptyHint}
        />
      )}
      {state.status === "ready" && state.workers.length > 0 && (
        <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
          {state.workers.map((worker) => {
            const removing = removingId === worker.id;
            const name = workerDisplayName(worker);
            return (
              <li key={worker.id}>
                <WorkerCard
                  variant="display"
                  worker={worker}
                  favourite
                  action={
                    <>
                      <Button
                        id={removeButtonId(worker.id)}
                        type="button"
                        variant="outline"
                        size="sm"
                        loading={removing}
                        disabled={!!removingId && !removing}
                        onClick={() => void remove(worker, state.workers)}
                      >
                        {!removing && <HeartOff aria-hidden />}
                        {removing ? COPY.removing : COPY.remove}
                        <span className="sr-only"> {name}</span>
                      </Button>
                      {failedId === worker.id && (
                        <div role="alert" className="mt-2">
                          <FieldError
                            id={`${removeButtonId(worker.id)}-error`}
                            message={DASHBOARD_COPY.favourite.error}
                          />
                        </div>
                      )}
                    </>
                  }
                />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

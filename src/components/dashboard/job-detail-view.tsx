"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CircleCheck,
  ClipboardList,
  Heart,
  HeartOff,
  Info,
  SearchX,
  UserRound,
} from "lucide-react";

import { CancelJobDialog } from "@/components/dashboard/cancel-job-dialog";
import { hasJobActions, JobActions } from "@/components/dashboard/job-actions";
import { takeJobSaved } from "@/components/dashboard/job-flash";
import { PageHeader, PAGE_TITLE_ID } from "@/components/dashboard/page-header";
import { RATE_TITLE_ID, RateJobForm } from "@/components/dashboard/rate-job-form";
import { usePageTitleFocus } from "@/components/dashboard/use-page-title-focus";
import { useRepost } from "@/components/dashboard/use-repost";
import { isActiveJob } from "@/components/dashboard/worker-lookup";
import { FieldError } from "@/components/forms/form-field";
import { FormAlert, nextAlertKey } from "@/components/forms/form-alert";
import { JobDetail } from "@/components/job/job-detail";
import { StatusBadge } from "@/components/job/status-badge";
import { WorkerCard } from "@/components/job/worker-card";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DASHBOARD_COPY, NAV_ITEMS, ROLE_HOME } from "@/lib/constants";
import { findCategory, formatDateTime, workerDisplayName } from "@/lib/job-builder";
import { useRevisitKey } from "@/lib/hooks/use-revisit-key";
import {
  favourites as favouriteService,
  isServiceError,
  jobs as jobService,
  workers as workerService,
} from "@/lib/mock/services";
import { useSessionStore } from "@/lib/store";
import type { Job, WorkerSummary } from "@/lib/types";

type Load =
  | { status: "loading" }
  | { status: "error"; retrying: boolean }
  | { status: "notFound" }
  | { status: "ready"; job: Job };

type WorkerState =
  | { state: "none" }
  | { state: "loading" }
  | { state: "ready"; summary: WorkerSummary }
  | { state: "fallback" };

type Favourites =
  | { status: "loading" }
  | { status: "error"; retrying: boolean }
  | { status: "ready"; ids: string[] };

type Flash = { key: number; message: string; autoFocus: boolean };

const COPY = DASHBOARD_COPY.detail;
const FAV = DASHBOARD_COPY.favourite;
const STATUS_ID = "detail-status";
const JOBS_HREF = NAV_ITEMS.customer[1].href;
const HISTORY_HREF = NAV_ITEMS.customer[2].href;
const HASH_TARGETS: Record<string, string> = {
  "#rate": RATE_TITLE_ID,
  "#receipt": "receipt-title",
};

/** Statuses whose worker can be added to or removed from Favourite Workers. */
const FAVOURITE_STATUSES: readonly Job["status"][] = ["accepted", "in_progress", "completed"];

/** Scrolls a section into view and focuses its heading (hash targets and "Rate this job"). */
function focusSection(titleId: string) {
  const title = document.getElementById(titleId);
  if (!title) return;
  title.closest("section")?.scrollIntoView({ block: "start" });
  title.focus({ preventScroll: true });
}

/**
 * `/dashboard/jobs/[id]`. Stays mounted for the route's lifetime and keys the
 * view per visit and per id (`useRevisitKey`). Render inside `<Suspense>`.
 */
export function JobDetailRoute() {
  const revisitKey = useRevisitKey();
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id ?? "");
  return <JobDetailView key={`${revisitKey}:${id}`} jobId={id} />;
}

function JobDetailView({ jobId }: { jobId: string }) {
  const userId = useSessionStore((state) => state.session?.user.id ?? null);
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const [load, setLoad] = React.useState<Load>({ status: "loading" });
  const [worker, setWorker] = React.useState<WorkerState>({ state: "none" });
  const [favourites, setFavourites] = React.useState<Favourites>({ status: "loading" });
  // Arrival from Edit: "Your changes are saved." (one-shot; the first initializer call wins in Strict Mode).
  const [flash, setFlash] = React.useState<Flash | null>(() =>
    takeJobSaved(jobId) ? { key: nextAlertKey(), message: COPY.savedFlash, autoFocus: true } : null,
  );
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const { repost, openingId, dialog } = useRepost();
  const startedOnMount = React.useRef(false);

  const job = load.status === "ready" ? load.job : null;
  usePageTitleFocus(titleRef, job !== null, !!flash);

  const loadFavourites = React.useCallback(async () => {
    if (!userId) return;
    try {
      const list = await favouriteService.list(userId);
      setFavourites({ status: "ready", ids: list.map((item) => item.id) });
    } catch {
      setFavourites({ status: "error", retrying: false });
    }
  }, [userId]);

  const loadJob = React.useCallback(
    async (quiet = false) => {
      let loaded: Job;
      try {
        loaded = await jobService.get(jobId);
      } catch (caught) {
        if (quiet) return;
        setLoad(
          isServiceError(caught) && caught.code === "JOB_NOT_FOUND"
            ? { status: "notFound" }
            : { status: "error", retrying: false },
        );
        return;
      }
      // Another customer's job looks the same as an unknown id (rule 3).
      if (loaded.customerId !== userId) {
        setLoad({ status: "notFound" });
        return;
      }
      setLoad({ status: "ready", job: loaded });
      if (quiet) return;

      const workerId = loaded.workerId;
      if (!workerId) {
        setWorker({ state: "none" });
        return;
      }
      setWorker({ state: "loading" });
      void workerService
        .getSummaries([workerId])
        .then(([summary]) =>
          setWorker(summary ? { state: "ready", summary } : { state: "fallback" }),
        )
        .catch(() => setWorker({ state: "fallback" }));
      if (FAVOURITE_STATUSES.includes(loaded.status)) void loadFavourites();
    },
    [jobId, userId, loadFavourites],
  );

  React.useEffect(() => {
    // Once per mount (Strict Mode runs effects twice; a second request would hide a ?mockError=1 failure).
    if (startedOnMount.current) return;
    startedOnMount.current = true;
    void loadJob();
  }, [loadJob]);

  // `#rate` / `#receipt` from History: the content loads async, so jump once it
  // has rendered. Read then (not on mount): after a client-side navigation the
  // URL, hash included, updates after the view mounts. Runs after the title
  // focus above, so the section wins.
  const ready = job !== null;
  const hashHandled = React.useRef(false);
  React.useEffect(() => {
    if (!ready || hashHandled.current) return;
    hashHandled.current = true;
    const target = HASH_TARGETS[window.location.hash];
    if (target) focusSection(target);
  }, [ready]);

  if (load.status === "loading") return <LoadingState variant="detail" label={COPY.loading} />;

  const backToDashboard = (
    <Button asChild variant="outline" className="w-full sm:w-auto">
      <Link href={ROLE_HOME.customer}>{COPY.backToDashboard}</Link>
    </Button>
  );

  if (load.status === "notFound") {
    return (
      <EmptyState
        headingLevel={1}
        icon={SearchX}
        title={COPY.notFoundTitle}
        description={COPY.notFoundDescription}
        action={
          <Button asChild>
            <Link href={ROLE_HOME.customer}>{COPY.backToDashboard}</Link>
          </Button>
        }
      />
    );
  }

  if (load.status === "error") {
    return (
      <ErrorState
        headingLevel={1}
        isRetrying={load.retrying}
        onRetry={() => {
          setLoad({ status: "error", retrying: true });
          void loadJob();
        }}
        secondaryAction={backToDashboard}
      />
    );
  }

  const current = load.job;
  const category = findCategory(current.category)?.name ?? current.category;
  const workerName = worker.state === "ready" ? workerDisplayName(worker.summary) : null;
  const active = isActiveJob(current);

  function updateJob(next: Job) {
    setLoad({ status: "ready", job: next });
  }

  const actions = hasJobActions(current) ? (
    <JobActions
      job={current}
      onCancel={() => {
        setFlash(null);
        setCancelOpen(true);
      }}
      onRate={() => focusSection(RATE_TITLE_ID)}
      onRepost={() => repost({ kind: "job", job: current })}
      reposting={openingId === current.id}
    />
  ) : null;

  return (
    <div>
      <PageHeader
        className="mb-0"
        titleRef={titleRef}
        title={COPY.title(category)}
        back={
          active
            ? { href: JOBS_HREF, label: COPY.backToJobs }
            : { href: HISTORY_HREF, label: COPY.backToHistory }
        }
        eyebrow={
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={current.status} />
            <p className="text-body-sm text-ink-muted">{COPY.reference(current.id)}</p>
          </div>
        }
        description={
          <p className="text-body-sm">
            <time dateTime={current.createdAt}>
              {COPY.posted(formatDateTime(current.createdAt))}
            </time>
            {current.completedAt && (
              <>
                {" · "}
                <time dateTime={current.completedAt}>
                  {COPY.completed(formatDateTime(current.completedAt))}
                </time>
              </>
            )}
          </p>
        }
      />

      <div id={STATUS_ID}>
        {flash && (
          <FormAlert
            key={flash.key}
            tone="success"
            message={flash.message}
            autoFocus={flash.autoFocus}
            className="mt-6"
          />
        )}
      </div>

      <JobDetail
        job={current}
        workerTitle={current.workerId ? COPY.workerTitle : COPY.whoTitle}
        workerName={workerName ?? COPY.workerFallback}
        worker={
          <WorkerBlock
            job={current}
            worker={worker}
            favourites={favourites}
            userId={userId}
            onFavouritesChange={(ids) => setFavourites({ status: "ready", ids })}
            onRetryFavourites={() => {
              setFavourites({ status: "error", retrying: true });
              void loadFavourites();
            }}
          />
        }
        actions={actions}
        rate={
          current.status === "completed" ? (
            <RateJobForm
              job={current}
              workerName={workerName}
              onRated={(next) => {
                setFlash(null);
                updateJob(next);
              }}
              onNotAllowed={() => void loadJob(true)}
            />
          ) : null
        }
      />

      <CancelJobDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        job={current}
        workerName={workerName}
        onCancelled={(next) => {
          updateJob(next);
          setFlash({ key: nextAlertKey(), message: COPY.cancelledFlash, autoFocus: false });
        }}
        onNotAllowed={() => void loadJob(true)}
        onClosedAfterChange={(result) => {
          if (result === "cancelled") {
            document.querySelector<HTMLElement>(`#${STATUS_ID} [tabindex="-1"]`)?.focus();
          } else {
            document.getElementById(PAGE_TITLE_ID)?.focus();
          }
        }}
      />
      {dialog}
    </div>
  );
}

/** The worker card with the favourite toggle, the board line, a skeleton or "Your worker". */
function WorkerBlock({
  job,
  worker,
  favourites,
  userId,
  onFavouritesChange,
  onRetryFavourites,
}: {
  job: Job;
  worker: WorkerState;
  favourites: Favourites;
  userId: string | null;
  onFavouritesChange: (ids: string[]) => void;
  onRetryFavourites: () => void;
}) {
  if (worker.state === "none") {
    return (
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-alt"
        >
          <ClipboardList className="size-5 text-ink" />
        </span>
        <div className="min-w-0">
          <p className="text-body font-semibold text-ink">{COPY.boardTitle}</p>
          <p className="text-body-sm text-ink-muted">{COPY.boardLine}</p>
        </div>
      </div>
    );
  }

  if (worker.state === "loading") {
    return (
      <div role="status" className="flex items-start gap-4">
        <span className="sr-only">{COPY.loadingWorker}</span>
        <Skeleton aria-hidden className="size-12 shrink-0 rounded-full" />
        <div aria-hidden className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (worker.state === "fallback") {
    return (
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-alt"
        >
          <UserRound className="size-5 text-ink" />
        </span>
        <p className="text-body font-semibold text-ink">{COPY.workerFallback}</p>
      </div>
    );
  }

  const canFavourite = FAVOURITE_STATUSES.includes(job.status);
  const isFavourite = favourites.status === "ready" && favourites.ids.includes(worker.summary.id);

  return (
    <WorkerCard
      variant="display"
      bordered={false}
      worker={worker.summary}
      favourite={isFavourite}
      action={
        canFavourite ? (
          <FavouriteToggle
            worker={worker.summary}
            favourites={favourites}
            userId={userId}
            onChange={onFavouritesChange}
            onRetry={onRetryFavourites}
          />
        ) : undefined
      }
    />
  );
}

/**
 * "Add to Favourite Workers" / "Remove from Favourite Workers" (T8 open
 * question 10). The label says what the button will do. Hidden while the
 * favourites list could not be loaded (toggling blind could remove one).
 */
function FavouriteToggle({
  worker,
  favourites,
  userId,
  onChange,
  onRetry,
}: {
  worker: WorkerSummary;
  favourites: Favourites;
  userId: string | null;
  onChange: (ids: string[]) => void;
  onRetry: () => void;
}) {
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [failed, setFailed] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const name = workerDisplayName(worker);

  if (favourites.status === "loading") {
    return <Skeleton aria-hidden className="h-11 w-full" />;
  }

  if (favourites.status === "error") {
    return (
      <p className="flex flex-wrap items-center gap-x-2 text-body-sm text-ink-muted">
        <Info className="size-4 shrink-0" aria-hidden />
        <span>{FAV.loadError}</span>
        <Button
          type="button"
          variant="link"
          size="sm"
          loading={favourites.retrying}
          onClick={onRetry}
        >
          {FAV.retry}
        </Button>
      </p>
    );
  }

  const ids = favourites.ids;
  const isFavourite = ids.includes(worker.id);

  async function toggle() {
    if (!userId || saving) return;
    setSaving(true);
    setFailed(false);
    setStatus(null);
    try {
      const nowFavourite = await favouriteService.toggle(userId, worker.id);
      onChange(nowFavourite ? [...ids, worker.id] : ids.filter((id) => id !== worker.id));
      setStatus(nowFavourite ? FAV.added(name) : FAV.removed(name));
    } catch {
      setFailed(true);
    } finally {
      // The button is disabled while saving; focus goes back to it.
      flushSync(() => setSaving(false));
      buttonRef.current?.focus();
    }
  }

  return (
    <div>
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        size="sm"
        className="w-full sm:w-auto lg:w-full"
        loading={saving}
        onClick={() => void toggle()}
      >
        {!saving && (isFavourite ? <HeartOff aria-hidden /> : <Heart aria-hidden />)}
        {saving ? FAV.saving : isFavourite ? FAV.remove : FAV.add}
      </Button>
      <p role="status" className="mt-2 flex items-start gap-2 text-body-sm text-ink empty:hidden">
        {status && (
          <>
            <CircleCheck className="size-4 shrink-0 text-success" aria-hidden />
            {status}
          </>
        )}
      </p>
      {failed && (
        <div role="alert" className="mt-2">
          <FieldError id="favourite-error" message={FAV.error} />
        </div>
      )}
    </div>
  );
}

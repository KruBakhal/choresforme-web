"use client";

import * as React from "react";
import { ClipboardList, UserRoundCheck, UsersRound } from "lucide-react";
import { Controller, useForm, useWatch, type FieldErrors } from "react-hook-form";
import type { z } from "zod";

import { SelectableCard } from "@/components/flow/selectable-card";
import { StepLayout } from "@/components/flow/step-layout";
import { FieldError } from "@/components/forms/form-field";
import { JobSummaryPanel } from "@/components/job/job-summary-panel";
import { WorkerCard } from "@/components/job/worker-card";
import { useDraftAutosave } from "@/components/post-job/use-draft-autosave";
import { useStepNavigation } from "@/components/post-job/use-step-navigation";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { RadioGroup } from "@/components/ui/radio-group";
import {
  JOB_BUILDER_COPY,
  MATCH_TYPE_LABELS,
  POST_JOB_STEPS,
  SCREEN_STATE_COPY,
} from "@/lib/constants";
import { stepRoute, workerDisplayName } from "@/lib/job-builder";
import { favourites, workers as workerService } from "@/lib/mock/services";
import { useJobDraftStore, useSessionStore } from "@/lib/store";
import type { JobDraft, MatchType, WorkerSummary } from "@/lib/types";
import { matchSchema, zodResolver } from "@/lib/validation";

type Values = z.input<typeof matchSchema>;
type Output = z.output<typeof matchSchema>;

type WorkerList =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; retrying: boolean }
  | { status: "success"; workers: WorkerSummary[]; favouriteIds: string[] };

const STEP = 5;
const TITLE_ID = "match-title";
const WORKERS_TITLE_ID = "workers-title";
const WORKER_ERROR_ID = "workerId-error";
const MATCH_ERROR_ID = "matchType-error";
const COPY = JOB_BUILDER_COPY.match;

const MATCH_OPTIONS = [
  { value: "board", icon: ClipboardList, description: COPY.boardDescription },
  { value: "direct", icon: UserRoundCheck, description: COPY.directDescription },
] as const satisfies readonly { value: MatchType; icon: unknown; description: string }[];

function toPatch(values: Partial<Values>): Partial<JobDraft> {
  const matchType = values.matchType ?? "board";
  return { matchType, workerId: matchType === "direct" ? values.workerId || undefined : undefined };
}

/** Favourites first, then the rest; each part keeps the service's rating order. */
function favouritesFirst(list: WorkerSummary[], favouriteIds: string[]): WorkerSummary[] {
  const isFavourite = (worker: WorkerSummary) => favouriteIds.includes(worker.id);
  return [...list.filter(isFavourite), ...list.filter((worker) => !isFavourite(worker))];
}

/**
 * Step 5 Who: Post to Job Board (default) or Pick a Worker from verified
 * workers serving the area and category. Favourites come first for a signed-in
 * customer. An empty list switches back to the job board (decision 12).
 */
export function MatchStep() {
  const goToStep = useStepNavigation();
  const draft = useJobDraftStore((state) => state.draft);
  const patchDraft = useJobDraftStore((state) => state.patchDraft);
  const completeStep = useJobDraftStore((state) => state.completeStep);

  const form = useForm<Values, unknown, Output>({
    resolver: zodResolver(matchSchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: { matchType: draft.matchType ?? "board", workerId: draft.workerId },
  });
  const values = useWatch({ control: form.control });
  const { errors } = form.formState;
  const workerError = errors.workerId?.message;

  const [list, setList] = React.useState<WorkerList>(() =>
    draft.matchType === "direct" ? { status: "loading" } : { status: "idle" },
  );
  const [switchedToBoard, setSwitchedToBoard] = React.useState(false);
  const requestId = React.useRef(0);
  const startedOnMount = React.useRef(false);

  const save = React.useCallback(
    (next: Partial<Values>) => patchDraft(toPatch(next)),
    [patchDraft],
  );
  const autosave = useDraftAutosave(values, save);

  const loadWorkers = React.useCallback(async () => {
    const id = requestId.current + 1;
    requestId.current = id;
    const { address, category } = useJobDraftStore.getState().draft;
    const user = useSessionStore.getState().session?.user;
    try {
      if (!address || !category) throw new Error("Incomplete draft");
      const found = await workerService.listForArea(address, category);
      let favouriteIds: string[] = [];
      if (user?.role === "customer" && found.length > 0) {
        // Favourites only sort and tag; the list still shows without them.
        favouriteIds = await favourites
          .list(user.id)
          .then((items) => items.map((item) => item.id))
          .catch(() => []);
      }
      if (id !== requestId.current) return;

      if (found.length === 0) {
        form.setValue("matchType", "board", { shouldDirty: true });
        form.setValue("workerId", undefined);
        form.clearErrors();
        setSwitchedToBoard(true);
        setList({ status: "idle" });
        return;
      }
      const savedWorker = form.getValues("workerId");
      if (savedWorker && !found.some((worker) => worker.id === savedWorker)) {
        // That worker no longer qualifies (rule 25).
        form.setValue("workerId", undefined, { shouldDirty: true });
      }
      setList({ status: "success", workers: favouritesFirst(found, favouriteIds), favouriteIds });
    } catch {
      if (id !== requestId.current) return;
      setList({ status: "error", retrying: false });
    }
  }, [form]);

  React.useEffect(() => {
    // Once per mount (Strict Mode runs effects twice; a second request would hide a ?mockError=1 failure).
    if (startedOnMount.current || list.status !== "loading") return;
    startedOnMount.current = true;
    void loadWorkers();
  }, [list.status, loadWorkers]);

  function chooseMatchType(next: MatchType) {
    form.setValue("matchType", next, { shouldDirty: true, shouldTouch: true });
    form.clearErrors();
    if (next === "direct") {
      setSwitchedToBoard(false);
      if (list.status !== "success") {
        startedOnMount.current = true;
        setList({ status: "loading" });
        void loadWorkers();
      }
    }
  }

  function retry() {
    setList({ status: "error", retrying: true });
    void loadWorkers();
  }

  function onInvalid(formErrors: FieldErrors<Values>) {
    if (formErrors.workerId && list.status === "success") form.setFocus("workerId");
    else form.setFocus("matchType");
  }

  function onValid(output: Output) {
    autosave.cancel();
    patchDraft(toPatch(output));
    completeStep(STEP);
    goToStep(stepRoute(STEP + 1));
  }

  function onBack() {
    autosave.cancel();
    save(form.getValues());
    goToStep(stepRoute(STEP - 1));
  }

  const direct = values.matchType === "direct";
  const workers = list.status === "success" ? list.workers : [];
  const favouriteIds = list.status === "success" ? list.favouriteIds : [];
  const pickedWorker = workers.find((worker) => worker.id === values.workerId);
  const showWorkerErrorUnderGrid = !!workerError && list.status === "success";

  return (
    <StepLayout
      step={STEP}
      steps={POST_JOB_STEPS}
      titleId={TITLE_ID}
      title={COPY.title}
      description={COPY.description}
      onSubmit={form.handleSubmit(onValid, onInvalid)}
      onBack={onBack}
      summary={
        <JobSummaryPanel
          draft={{ ...draft, ...toPatch(values) }}
          currentStep={STEP}
          workerName={pickedWorker ? workerDisplayName(pickedWorker) : undefined}
        />
      }
    >
      <div className="flex flex-col gap-4">
        <Controller
          control={form.control}
          name="matchType"
          render={({ field }) => (
            <RadioGroup
              name={field.name}
              value={field.value}
              onValueChange={(value) => chooseMatchType(value as MatchType)}
              aria-labelledby={TITLE_ID}
              aria-describedby={
                workerError && !showWorkerErrorUnderGrid ? MATCH_ERROR_ID : undefined
              }
              className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2"
            >
              {MATCH_OPTIONS.map((option) => (
                <SelectableCard
                  key={option.value}
                  ref={field.value === option.value ? field.ref : undefined}
                  type="radio"
                  layout="tile"
                  value={option.value}
                  title={MATCH_TYPE_LABELS[option.value]}
                  description={option.description}
                  icon={option.icon}
                  onBlur={field.onBlur}
                />
              ))}
            </RadioGroup>
          )}
        />
        {workerError && !showWorkerErrorUnderGrid && (
          <FieldError id={MATCH_ERROR_ID} message={workerError} />
        )}
        <div role="status">
          {switchedToBoard && !direct && (
            <EmptyState
              icon={UsersRound}
              headingLevel={2}
              title={SCREEN_STATE_COPY.pickWorkerEmpty}
              description={COPY.emptyDescription}
            />
          )}
        </div>
      </div>

      {direct && list.status !== "idle" && (
        <section aria-labelledby={WORKERS_TITLE_ID} className="flex flex-col gap-4">
          <div>
            <h2 id={WORKERS_TITLE_ID} className="text-h4 font-semibold text-ink">
              {COPY.workersTitle}
            </h2>
            <p role="status" className="mt-1 text-body-sm text-ink-muted">
              {list.status === "success"
                ? [
                    COPY.workersCount(workers.length, draft.address?.city ?? ""),
                    favouriteIds.length > 0 ? COPY.favouritesFirst : "",
                  ]
                    .filter(Boolean)
                    .join(" ")
                : ""}
            </p>
          </div>

          {list.status === "loading" && (
            <LoadingState variant="workers" count={3} label={COPY.loadingWorkers} />
          )}
          {list.status === "error" && (
            <ErrorState headingLevel={3} onRetry={retry} isRetrying={list.retrying} />
          )}
          {list.status === "success" && (
            <Controller
              control={form.control}
              name="workerId"
              render={({ field }) => (
                <RadioGroup
                  name={field.name}
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  aria-labelledby={WORKERS_TITLE_ID}
                  aria-describedby={showWorkerErrorUnderGrid ? WORKER_ERROR_ID : undefined}
                  className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
                >
                  {workers.map((worker, index) => {
                    const focusTarget = field.value ? field.value === worker.id : index === 0;
                    return (
                      <WorkerCard
                        key={worker.id}
                        ref={focusTarget ? field.ref : undefined}
                        worker={worker}
                        favourite={favouriteIds.includes(worker.id)}
                        invalid={showWorkerErrorUnderGrid}
                        describedBy={showWorkerErrorUnderGrid ? WORKER_ERROR_ID : undefined}
                        onBlur={field.onBlur}
                      />
                    );
                  })}
                </RadioGroup>
              )}
            />
          )}
          {showWorkerErrorUnderGrid && <FieldError id={WORKER_ERROR_ID} message={workerError} />}
        </section>
      )}
    </StepLayout>
  );
}

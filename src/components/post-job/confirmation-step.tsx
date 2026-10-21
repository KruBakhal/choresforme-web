"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CircleCheck,
  ClipboardList,
  CreditCard,
  Info,
  Mail,
  SearchX,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { ReviewSummary, type ReviewWorker } from "@/components/flow/review-summary";
import { takeFocusRequest } from "@/components/flow/step-layout";
import { Stepper } from "@/components/flow/stepper";
import { focusFirstError } from "@/components/forms/focus-first-error";
import { FormAlert, nextAlertKey } from "@/components/forms/form-alert";
import { AppPrompt } from "@/components/layout/app-prompt";
import {
  rememberedTemplateResult,
  rememberedWorkerName,
  rememberWorkerName,
} from "@/components/post-job/post-job-memory";
import { SaveTemplateField } from "@/components/post-job/save-template-field";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  APP_PROMPT_COPY,
  AUTH_COPY,
  JOB_BUILDER_COPY,
  POST_JOB_STEPS,
  ROLE_HOME,
  SCREEN_STATE_COPY,
  SERVICE_MESSAGES,
} from "@/lib/constants";
import { useRevisitKey } from "@/lib/hooks/use-revisit-key";
import { useAppPromptState } from "@/lib/hooks/use-app-prompt";
import { firstIncompleteStep, REVIEW_STEP, stepRoute, workerDisplayName } from "@/lib/job-builder";
import {
  isServiceError,
  jobs as jobService,
  templates,
  workers as workerService,
} from "@/lib/mock/services";
import { isJobDraftEmpty, useJobDraftStore, useSessionStore } from "@/lib/store";
import type { Job, JobDraft } from "@/lib/types";
import { saveTemplateSchema, zodResolver } from "@/lib/validation";

type JobLoad =
  | { status: "loading" }
  | { status: "error"; retrying: boolean }
  | { status: "notFound" }
  | { status: "success"; job: Job };

const STEP = 8;
const TITLE_ID = "confirmation-title";
const STATUS_ID = `${TITLE_ID}-status`;
const SUMMARY_TITLE_ID = "confirmation-summary-title";
const NEXT_TITLE_ID = "next-title";
const TEMPLATE_STATUS_ID = "template-status";
const COPY = JOB_BUILDER_COPY.confirmation;
const DASHBOARD = ROLE_HOME.customer;
const NEW_JOB = stepRoute(1);

/**
 * Step 8 Confirmation (`/post-job/confirmation?job=<id>`). Stays mounted for
 * the route's lifetime and keys the view with `useRevisitKey`, so a revisit
 * (Cache Components restores the route) loads the job again. Render inside
 * `<Suspense>` (it reads the URL) and `RequireRole role="customer"`.
 */
export function ConfirmationStep() {
  const revisitKey = useRevisitKey();
  const jobId = useSearchParams().get("job");
  return <ConfirmationView key={`${revisitKey}:${jobId ?? ""}`} jobId={jobId} />;
}

function ConfirmationView({ jobId }: { jobId: string | null }) {
  if (!jobId) return <NoJobRedirect />;
  return <JobConfirmation jobId={jobId} />;
}

/**
 * No `?job=` (open question 14): a draft in progress goes to its first
 * incomplete step (or Review), otherwise to the dashboard.
 */
function NoJobRedirect() {
  const router = useRouter();

  React.useEffect(() => {
    const draft = useJobDraftStore.getState().draft;
    router.replace(
      isJobDraftEmpty(draft) ? DASHBOARD : (firstIncompleteStep(draft) ?? stepRoute(REVIEW_STEP)),
    );
  }, [router]);

  return <ConfirmationLoading />;
}

function ConfirmationStepper() {
  return (
    <div className="mb-8 lg:mb-12">
      <Stepper
        steps={POST_JOB_STEPS}
        current={STEP}
        ariaLabel={JOB_BUILDER_COPY.stepper.ariaLabel}
        statusId={STATUS_ID}
      />
    </div>
  );
}

function ConfirmationLoading() {
  return (
    <div>
      <ConfirmationStepper />
      <LoadingState variant="confirmation" label={COPY.loading} />
    </div>
  );
}

function JobConfirmation({ jobId }: { jobId: string }) {
  const userId = useSessionStore((state) => state.session?.user.id ?? null);
  const [load, setLoad] = React.useState<JobLoad>({ status: "loading" });
  const [worker, setWorker] = React.useState<ReviewWorker>({ state: "loading" });
  const startedOnMount = React.useRef(false);

  const loadJob = React.useCallback(async () => {
    let job: Job;
    try {
      job = await jobService.get(jobId);
    } catch (caught) {
      setLoad(
        isServiceError(caught) && caught.code === "JOB_NOT_FOUND"
          ? { status: "notFound" }
          : { status: "error", retrying: false },
      );
      return;
    }
    // Another customer's job looks the same as an unknown id.
    if (job.customerId !== userId) {
      setLoad({ status: "notFound" });
      return;
    }

    // Pick a Worker: the name from Review, or a lookup (open question 8).
    const remembered = rememberedWorkerName(job.workerId);
    if (job.matchType === "direct" && job.workerId && !remembered) {
      setWorker({ state: "loading" });
      void workerService
        .listForArea(job.address, job.category)
        .then((found) => {
          const picked = found.find((item) => item.id === job.workerId);
          if (!picked) {
            setWorker({ state: "error" });
            return;
          }
          const name = workerDisplayName(picked);
          rememberWorkerName(picked.id, name);
          setWorker({ state: "ready", name });
        })
        .catch(() => setWorker({ state: "error" }));
    } else {
      setWorker({ state: "ready", name: remembered });
    }
    setLoad({ status: "success", job });
  }, [jobId, userId]);

  React.useEffect(() => {
    // Once per mount (Strict Mode runs effects twice; a second request would hide a ?mockError=1 failure).
    if (startedOnMount.current) return;
    startedOnMount.current = true;
    void loadJob();
  }, [loadJob]);

  function retry() {
    setLoad({ status: "error", retrying: true });
    void loadJob();
  }

  if (load.status === "loading") return <ConfirmationLoading />;

  if (load.status === "notFound") {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <EmptyState
          headingLevel={1}
          icon={SearchX}
          title={SCREEN_STATE_COPY.jobNotFound}
          description={COPY.notFoundDescription}
          action={
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild className="w-full sm:w-auto">
                <Link href={DASHBOARD}>{AUTH_COPY.separate.goToDashboard}</Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href={NEW_JOB}>{COPY.postJob}</Link>
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  if (load.status === "error") {
    return (
      <div>
        <ConfirmationStepper />
        <div className="mx-auto w-full max-w-2xl">
          <ErrorState
            headingLevel={1}
            onRetry={retry}
            isRetrying={load.retrying}
            secondaryAction={
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href={DASHBOARD}>{AUTH_COPY.separate.goToDashboard}</Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return <JobPosted job={load.job} userId={userId} worker={worker} />;
}

function JobPosted({
  job,
  userId,
  worker,
}: {
  job: Job;
  userId: string | null;
  worker: ReviewWorker;
}) {
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const dashboardRef = React.useRef<HTMLAnchorElement>(null);
  const prompt = useAppPromptState("customer");
  const [promptDismissed, setPromptDismissed] = React.useState(false);

  // Arrival from Payment: the heading takes focus. A reload or a direct link never moves it.
  React.useEffect(() => {
    if (takeFocusRequest()) headingRef.current?.focus();
  }, []);

  // On Android the Play Store button is the page's primary action (orchestrator decision 2).
  const androidPrompt =
    prompt.status === "visible" && prompt.variant === "android" && !promptDismissed;
  const direct = job.matchType === "direct";
  const workerName =
    worker.state === "ready" && worker.name ? worker.name : JOB_BUILDER_COPY.review.workerFallback;

  function handlePromptDismissed() {
    setPromptDismissed(true);
    dashboardRef.current?.focus();
  }

  return (
    <div>
      <ConfirmationStepper />
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <header>
          <span
            aria-hidden
            className="flex size-12 items-center justify-center rounded-full bg-brand-soft"
          >
            <CircleCheck className="size-6 text-ink" />
          </span>
          <h1
            ref={headingRef}
            id={TITLE_ID}
            tabIndex={-1}
            aria-describedby={STATUS_ID}
            className="mt-4 text-h3 outline-none focus-visible:outline-2 md:text-h2"
          >
            {COPY.title}
          </h1>
          <p className="mt-2 text-body text-ink-muted">{COPY.description}</p>
        </header>

        <section aria-labelledby={NEXT_TITLE_ID} className="rounded-lg bg-surface-alt p-4 md:p-6">
          <h2 id={NEXT_TITLE_ID} className="text-h4 font-semibold text-ink">
            {COPY.nextTitle}
          </h2>
          <ul className="mt-4 flex flex-col gap-4">
            {direct ? (
              <NextItem icon={UserRoundCheck}>
                {worker.state === "loading" ? (
                  <span role="status" className="inline-flex items-center gap-2">
                    <Skeleton aria-hidden className="inline-block h-4 w-48" />
                    <span className="sr-only">{JOB_BUILDER_COPY.review.workerLoading}</span>
                  </span>
                ) : (
                  COPY.nextDirect(workerName)
                )}
              </NextItem>
            ) : (
              <NextItem icon={ClipboardList}>{COPY.nextBoard}</NextItem>
            )}
            <NextItem icon={Mail}>{COPY.nextUpdates}</NextItem>
            <NextItem icon={CreditCard}>{COPY.nextCharge}</NextItem>
          </ul>
        </section>

        <ReviewSummary
          source={{ kind: "job", job }}
          editable={false}
          titleId={SUMMARY_TITLE_ID}
          title={COPY.summaryTitle}
          status={job.status}
          worker={direct ? worker : undefined}
        />

        <TemplateSection job={job} userId={userId} />

        <AppPrompt
          app="customer"
          androidTitle={APP_PROMPT_COPY.customer.androidTitle}
          androidBody={APP_PROMPT_COPY.customer.androidBody}
          installLabel={APP_PROMPT_COPY.customer.install}
          updatesText={APP_PROMPT_COPY.customer.updates}
          onDismissed={handlePromptDismissed}
        />
        <span role="status" className="sr-only">
          {promptDismissed ? COPY.promptHidden : ""}
        </span>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            variant={androidPrompt ? "secondary" : "default"}
            className="w-full sm:w-auto"
          >
            <Link ref={dashboardRef} href={DASHBOARD}>
              {AUTH_COPY.separate.goToDashboard}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={NEW_JOB}>{COPY.postAnother}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function NextItem({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-body text-ink">
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface"
      >
        <Icon className="size-5 text-ink" />
      </span>
      <p className="min-w-0 pt-2">{children}</p>
    </li>
  );
}

/** The posted job as a template draft, without photos (their object URLs are gone). */
function templateDraft(job: Job): JobDraft {
  return {
    category: job.category,
    subServices: job.subServices,
    otherText: job.otherText,
    address: job.address,
    description: job.description,
    pricingType: job.pricingType,
    amount: job.amount,
    hours: job.hours,
    matchType: job.matchType,
    workerId: job.workerId,
    savedAsTemplate: true,
    lastStep: REVIEW_STEP,
  };
}

type TemplateValues = z.input<typeof saveTemplateSchema>;
type TemplateOutput = z.output<typeof saveTemplateSchema>;
const TEMPLATE_FIELD_ORDER = ["name"] as const;

/**
 * "Saved as template" when Payment saved it, or the name-only offer
 * (open question 13): the box wasn't ticked, saving failed, or a reload
 * without `savedAsTemplate`.
 */
function TemplateSection({ job, userId }: { job: Job; userId: string | null }) {
  const remembered = rememberedTemplateResult(job.id);
  const [savedHere, setSavedHere] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [alertKey, setAlertKey] = React.useState(0);
  const [alertMessage, setAlertMessage] = React.useState<string | null>(null);
  const statusRef = React.useRef<HTMLParagraphElement>(null);

  const form = useForm<TemplateValues, unknown, TemplateOutput>({
    resolver: zodResolver(saveTemplateSchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: { name: remembered?.status === "failed" ? remembered.name : "" },
  });

  React.useEffect(() => {
    if (savedHere !== null) statusRef.current?.focus();
  }, [savedHere]);

  async function onValid(output: TemplateOutput) {
    if (!userId || saving) return;
    setSaving(true);
    setAlertMessage(null);
    try {
      await templates.save(userId, output.name, templateDraft(job));
      setSavedHere(output.name);
    } catch (caught) {
      setAlertMessage(isServiceError(caught) ? caught.message : SERVICE_MESSAGES.mockError);
      setAlertKey(nextAlertKey());
      setSaving(false);
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    void form.handleSubmit(onValid, focusFirstError(TEMPLATE_FIELD_ORDER, form.setFocus))(event);
  }

  const savedName = savedHere ?? (remembered?.status === "saved" ? remembered.name : null);
  const savedWithoutName = savedName === null && !remembered && job.savedAsTemplate === true;

  if (savedName !== null || savedWithoutName) {
    return (
      <p
        ref={statusRef}
        id={TEMPLATE_STATUS_ID}
        tabIndex={-1}
        className="flex items-start gap-2 rounded-lg border border-border bg-surface p-4 text-body text-ink outline-none focus-visible:outline-2"
      >
        <CircleCheck className="mt-1 size-5 shrink-0 text-success" aria-hidden />
        <span>
          {savedName !== null ? COPY.templateSaved(savedName) : COPY.templateSavedNoName}
          <span className="block text-body-sm text-ink-muted">{COPY.templateSavedHint}</span>
        </span>
      </p>
    );
  }

  return (
    <section
      aria-labelledby="template-offer-title"
      className="rounded-lg border border-border bg-surface p-4 md:p-6"
    >
      <h2 id="template-offer-title" className="text-h4 font-semibold text-ink">
        {COPY.templateOfferTitle}
      </h2>
      <p className="mt-1 text-body-sm text-ink-muted">{COPY.templateOfferHint}</p>
      {remembered?.status === "failed" && (
        <p className="mt-4 flex items-start gap-2 text-body-sm text-ink-muted">
          <Info className="mt-1 size-4 shrink-0" aria-hidden />
          {COPY.templateSaveFailed}
        </p>
      )}
      {alertMessage && (
        <FormAlert key={alertKey} tone="error" message={alertMessage} className="mt-4" />
      )}
      <form noValidate onSubmit={onSubmit} className="mt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <SaveTemplateField
            variant="nameOnly"
            nameId="confirm-template-name"
            nameProps={form.register("name")}
            nameError={form.formState.errors.name?.message}
            readOnly={saving}
            className="min-w-0 flex-1"
          />
          <Button
            type="submit"
            variant="secondary"
            loading={saving}
            className="w-full sm:mt-8 sm:w-auto"
          >
            {saving ? COPY.templateSaving : COPY.templateSave}
          </Button>
        </div>
      </form>
    </section>
  );
}

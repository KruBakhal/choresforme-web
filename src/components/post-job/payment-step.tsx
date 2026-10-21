"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { Ban, CalendarCheck } from "lucide-react";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import type { z } from "zod";

import { markStepNavigation, StepLayout } from "@/components/flow/step-layout";
import { CardFields } from "@/components/forms/card-fields";
import { focusFirstError } from "@/components/forms/focus-first-error";
import { FormAlert, nextAlertKey } from "@/components/forms/form-alert";
import { JobSummaryPanel } from "@/components/job/job-summary-panel";
import { NEW_CARD_VALUE, PaymentMethodPicker } from "@/components/job/payment-method-picker";
import { ExternalLink } from "@/components/marketing/external-link";
import { useHoldStepGuard } from "@/components/post-job/job-step-route";
import {
  rememberedWorkerName,
  rememberTemplateResult,
  type TemplateResult,
} from "@/components/post-job/post-job-memory";
import { useStepNavigation } from "@/components/post-job/use-step-navigation";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { loginHref } from "@/lib/auth/redirect";
import {
  FAQ_HREF,
  JOB_BUILDER_COPY,
  POST_JOB_STEPS,
  PRICING_TYPE_LABELS,
  SCREEN_STATE_COPY,
} from "@/lib/constants";
import { estimatedTotal, formatUsd, stepRoute } from "@/lib/job-builder";
import { isServiceError, jobs as jobService, payments, templates } from "@/lib/mock/services";
import { useJobDraftStore, useSessionStore } from "@/lib/store";
import type { JobDraft, PaymentMethod } from "@/lib/types";
import { paymentSchema, zodResolver } from "@/lib/validation";

type Values = {
  /** A saved method id, or `NEW_CARD_VALUE`. Empty while the list loads. */
  choice: string;
  card?: { number?: string; expiry?: string; cvc?: string };
};
type Output = z.output<typeof paymentSchema>;

type Methods =
  | { status: "loading" }
  | { status: "error"; retrying: boolean }
  | { status: "success"; methods: PaymentMethod[] };

const STEP = 7;
const TITLE_ID = "payment-title";
const CARD_PANEL_ID = "card-panel";
const CHARGE_TITLE_ID = "charge-title";
const FIELD_ORDER = ["card.number", "card.expiry", "card.cvc"] as const;
const COPY = JOB_BUILDER_COPY.payment;
const ROUTE = stepRoute(STEP);

const schemaResolver = zodResolver(paymentSchema);

/** Maps the form to the schema's input: a saved method, or the new card. */
const paymentResolver: Resolver<Values, unknown, Output> = (values, context, options) =>
  schemaResolver(
    (values.choice === NEW_CARD_VALUE
      ? { method: "new", card: values.card ?? {} }
      : { method: "saved", methodId: values.choice }) as Parameters<typeof schemaResolver>[0],
    context,
    options as unknown as Parameters<typeof schemaResolver>[2],
  ) as ReturnType<Resolver<Values, unknown, Output>>;

/**
 * Step 7 Payment: a saved card or a new one, the charge rule next to the
 * button, and one "Post job" action that adds the card (if new), posts the
 * job, saves the template (if ticked), clears the draft and opens
 * Confirmation (decisions 2, 3 and 5).
 *
 * Analytics trigger points for T11 (no events fire in T7): `payment_added`
 * is the resolved `payments.addMethod`, `job_posted` the resolved
 * `jobs.create`, both in `onValid`.
 */
export function PaymentStep() {
  const router = useRouter();
  const goToStep = useStepNavigation();
  const holdGuard = useHoldStepGuard();
  const draft = useJobDraftStore((state) => state.draft);
  const clearDraft = useJobDraftStore((state) => state.clear);
  const userId = useSessionStore((state) => state.session?.user.id ?? null);

  // The draft being posted: the summary keeps showing it after the draft is cleared.
  const [posted, setPosted] = React.useState<JobDraft | null>(null);
  const shownDraft = posted ?? draft;

  const [methods, setMethods] = React.useState<Methods>({ status: "loading" });
  const [posting, setPosting] = React.useState(false);
  const [cardFailed, setCardFailed] = React.useState(0);
  const [postFailed, setPostFailed] = React.useState(0);
  const startedOnMount = React.useRef(false);
  const postingRef = React.useRef(false);

  const form = useForm<Values, unknown, Output>({
    resolver: paymentResolver,
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: { choice: "" },
  });
  const choice = useWatch({ control: form.control, name: "choice" });
  const numberValue = useWatch({ control: form.control, name: "card.number" }) ?? "";
  const { errors } = form.formState;

  const loadMethods = React.useCallback(async () => {
    if (!userId) return;
    try {
      const list = await payments.listMethods(userId);
      setMethods({ status: "success", methods: list });
      // The first saved card is preselected; with none, the card form shows directly.
      form.setValue("choice", list[0]?.id ?? NEW_CARD_VALUE);
    } catch {
      setMethods({ status: "error", retrying: false });
    }
  }, [form, userId]);

  React.useEffect(() => {
    // Once per mount (Strict Mode runs effects twice; a second request would hide a ?mockError=1 failure).
    if (startedOnMount.current) return;
    startedOnMount.current = true;
    void loadMethods();
  }, [loadMethods]);

  function retry() {
    setMethods({ status: "error", retrying: true });
    void loadMethods();
  }

  async function onValid(output: Output) {
    if (postingRef.current || !userId) return;
    postingRef.current = true;
    const state = useJobDraftStore.getState();
    const postDraft = state.draft;
    const templateName = state.templateName;
    setPosting(true);
    setPosted(postDraft);
    setCardFailed(0);
    setPostFailed(0);

    function stop() {
      postingRef.current = false;
      setPosting(false);
      setPosted(null);
    }

    // (a) A new card is added first; nothing is posted if it fails.
    if (output.method === "new") {
      try {
        const method = await payments.addMethod(userId, output.card);
        // `payment_added` trigger point (T11): brand only, never digits.
        // Saved now: a Retry after a failed post must not add it twice.
        setMethods((current) =>
          current.status === "success"
            ? { status: "success", methods: [...current.methods, method] }
            : { status: "success", methods: [method] },
        );
        form.setValue("choice", method.id);
      } catch {
        stop();
        setCardFailed(nextAlertKey());
        return;
      }
    }

    // (b) Post the job.
    let jobId: string;
    try {
      const job = await jobService.create(postDraft);
      // `job_posted` trigger point (T11).
      jobId = job.id;
    } catch (caught) {
      stop();
      if (isServiceError(caught) && caught.code === "SIGN_IN_REQUIRED") {
        router.replace(loginHref(ROUTE));
        return;
      }
      setPostFailed(nextAlertKey());
      return;
    }

    // (c) Save the template; a failure never blocks posting (Confirmation offers it again).
    let result: TemplateResult = { status: "none" };
    if (postDraft.savedAsTemplate && templateName) {
      try {
        // Without photos: their object URLs die when the draft is cleared.
        await templates.save(userId, templateName, { ...postDraft, photos: undefined });
        result = { status: "saved", name: templateName };
      } catch {
        result = { status: "failed", name: templateName };
      }
    }
    rememberTemplateResult(jobId, result);

    // (d) Clear the draft (revokes the photo URLs) and open Confirmation. The
    // guard is held so the cleared draft never flashes a redirect to step 1,
    // and the button keeps its spinner until the route changes.
    // `flushSync`: the hold must be committed before the store update renders.
    flushSync(holdGuard);
    clearDraft();
    markStepNavigation();
    router.replace(`${stepRoute(STEP + 1)}?job=${encodeURIComponent(jobId)}`);
  }

  function onBack() {
    goToStep(stepRoute(STEP - 1));
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    void form.handleSubmit(onValid, focusFirstError(FIELD_ORDER, form.setFocus))(event);
  }

  const total = estimatedTotal(shownDraft.pricingType, shownDraft.amount, shownDraft.hours);
  const breakdown =
    shownDraft.pricingType === "hourly" &&
    shownDraft.amount !== undefined &&
    shownDraft.hours !== undefined
      ? JOB_BUILDER_COPY.summary.hourlyBreakdown(formatUsd(shownDraft.amount), shownDraft.hours)
      : PRICING_TYPE_LABELS.fixed;
  const showCard = methods.status === "success" && choice === NEW_CARD_VALUE;

  return (
    <StepLayout
      step={STEP}
      steps={POST_JOB_STEPS}
      titleId={TITLE_ID}
      title={COPY.title}
      description={COPY.description}
      onSubmit={onSubmit}
      onBack={onBack}
      backDisabled={posting}
      continueLabel={posting ? COPY.submitting : COPY.submit}
      loading={posting}
      continueDisabled={methods.status !== "success"}
      summaryFirst
      summary={
        <JobSummaryPanel
          draft={shownDraft}
          currentStep={STEP}
          workerName={rememberedWorkerName(shownDraft.workerId)}
        />
      }
    >
      <fieldset disabled={posting} className="contents">
        {methods.status === "loading" && (
          <section aria-labelledby="payment-methods-title" className="flex flex-col gap-4">
            <h2 id="payment-methods-title" className="text-h4 font-semibold text-ink">
              {COPY.methodsTitle}
            </h2>
            <LoadingState variant="rows" count={2} label={COPY.methodsLoading} />
          </section>
        )}
        {methods.status === "error" && (
          <section aria-labelledby="payment-methods-title" className="flex flex-col gap-4">
            <h2 id="payment-methods-title" className="text-h4 font-semibold text-ink">
              {COPY.methodsTitle}
            </h2>
            <ErrorState headingLevel={3} onRetry={retry} isRetrying={methods.retrying} />
          </section>
        )}
        {methods.status === "success" && (
          <Controller
            control={form.control}
            name="choice"
            render={({ field }) => (
              <PaymentMethodPicker
                ref={field.ref}
                methods={methods.methods}
                value={field.value}
                onValueChange={(next) => {
                  field.onChange(next);
                  form.clearErrors("card");
                  setCardFailed(0);
                }}
                onBlur={field.onBlur}
                cardPanelId={CARD_PANEL_ID}
              >
                {showCard && (
                  <CardFields
                    panelId={CARD_PANEL_ID}
                    numberValue={numberValue}
                    fields={{
                      number: form.register("card.number", { shouldUnregister: true }),
                      expiry: form.register("card.expiry", { shouldUnregister: true }),
                      cvc: form.register("card.cvc", { shouldUnregister: true }),
                    }}
                    errors={{
                      number: errors.card?.number?.message,
                      expiry: errors.card?.expiry?.message,
                      cvc: errors.card?.cvc?.message,
                    }}
                    alert={
                      cardFailed > 0 && (
                        <FormAlert
                          key={cardFailed}
                          tone="error"
                          message={SCREEN_STATE_COPY.cardError}
                        />
                      )
                    }
                  />
                )}
              </PaymentMethodPicker>
            )}
          />
        )}

        <section
          aria-labelledby={CHARGE_TITLE_ID}
          className="rounded-lg border border-border bg-surface p-4 md:p-6"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h2 id={CHARGE_TITLE_ID} className="text-body font-semibold text-ink">
              {COPY.estimateLabel}
            </h2>
            <p className="text-h3 font-semibold text-ink">
              {total === null ? JOB_BUILDER_COPY.summary.estimateEmpty : formatUsd(total)}
            </p>
          </div>
          <p className="text-body-sm text-ink-muted">{breakdown}</p>
          <ul className="mt-4 flex flex-col gap-2 text-body-sm text-ink">
            <li className="flex items-start gap-2">
              <CalendarCheck className="size-5 shrink-0" aria-hidden />
              {COPY.charged}
            </li>
            <li className="flex items-start gap-2">
              <Ban className="size-5 shrink-0" aria-hidden />
              {COPY.noRefunds}
            </li>
          </ul>
          <ExternalLink
            href={`${FAQ_HREF}#${COPY.faqLink.id}`}
            className="mt-2 inline-flex min-h-11 items-center gap-2 text-body-sm text-ink underline underline-offset-4"
          >
            {COPY.faqLink.label}
          </ExternalLink>
        </section>

        {postFailed > 0 && (
          <FormAlert key={postFailed} tone="error" message={SCREEN_STATE_COPY.jobBuilderError} />
        )}
      </fieldset>
      <span className="sr-only" role="status" aria-live="polite">
        {posting ? COPY.submitting : ""}
      </span>
    </StepLayout>
  );
}

"use client";

import * as React from "react";
import { ArrowDown } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { z } from "zod";

import { ReviewSummary, type ReviewWorker } from "@/components/flow/review-summary";
import { StepLayout } from "@/components/flow/step-layout";
import { focusFirstError } from "@/components/forms/focus-first-error";
import { ExternalLink } from "@/components/marketing/external-link";
import { rememberWorkerName } from "@/components/post-job/post-job-memory";
import {
  REVIEW_AUTH_ID,
  REVIEW_AUTH_TITLE_ID,
  REVIEW_FORM_ID,
  ReviewAuthPanel,
} from "@/components/post-job/review-auth-panel";
import { SaveTemplateField } from "@/components/post-job/save-template-field";
import { useDraftAutosave } from "@/components/post-job/use-draft-autosave";
import { useStepNavigation } from "@/components/post-job/use-step-navigation";
import { Button } from "@/components/ui/button";
import { isProfileComplete } from "@/lib/auth/redirect";
import { FAQ_HREF, JOB_BUILDER_COPY, POST_JOB_STEPS } from "@/lib/constants";
import { REVIEW_STEP, stepRoute, workerDisplayName } from "@/lib/job-builder";
import { workers as workerService } from "@/lib/mock/services";
import { useJobDraftStore, useSessionStore } from "@/lib/store";
import { reviewSchema, zodResolver } from "@/lib/validation";

type Values = z.input<typeof reviewSchema>;
type Output = z.output<typeof reviewSchema>;

const STEP = REVIEW_STEP;
const TITLE_ID = "review-title";
const SUMMARY_TITLE_ID = "review-summary-title";
const HELP_TITLE_ID = "review-help-title";
const FIELD_ORDER = ["templateName"] as const satisfies readonly (keyof Values)[];
const COPY = JOB_BUILDER_COPY.review;

const helpLinkClass =
  "inline-flex min-h-11 items-center gap-2 text-body-sm text-ink underline underline-offset-4 transition-colors duration-150 hover:decoration-2 motion-reduce:transition-none";

/**
 * Step 6 Review & Post: the whole job with Edit links, Save As Template, and
 * the inline account card. A guest signs up or logs in here and stays on
 * Review; "Continue to payment" is only on the Post card (open question 2).
 */
export function ReviewStep() {
  const goToStep = useStepNavigation();
  const draft = useJobDraftStore((state) => state.draft);
  const storedName = useJobDraftStore((state) => state.templateName);
  const patchDraft = useJobDraftStore((state) => state.patchDraft);
  const setTemplateName = useJobDraftStore((state) => state.setTemplateName);
  const completeStep = useJobDraftStore((state) => state.completeStep);
  const user = useSessionStore((state) => state.session?.user ?? null);
  const isCustomer = user?.role === "customer" && isProfileComplete(user);

  const form = useForm<Values, unknown, Output>({
    resolver: zodResolver(reviewSchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {
      savedAsTemplate: draft.savedAsTemplate ?? false,
      templateName: storedName ?? "",
    },
  });
  const values = useWatch({ control: form.control });
  const { errors } = form.formState;

  const save = React.useCallback(
    (next: Partial<Values>) => {
      patchDraft({ savedAsTemplate: next.savedAsTemplate ?? false });
      setTemplateName(next.templateName || undefined);
    },
    [patchDraft, setTemplateName],
  );
  const autosave = useDraftAutosave(values, save);

  // Pick a Worker: the worker's name (open question 8).
  const direct = draft.matchType === "direct";
  const [worker, setWorker] = React.useState<ReviewWorker>({ state: "loading" });
  const requestId = React.useRef(0);
  const startedOnMount = React.useRef(false);

  const loadWorker = React.useCallback(async () => {
    const id = requestId.current + 1;
    requestId.current = id;
    const { address, category, workerId } = useJobDraftStore.getState().draft;
    try {
      if (!address || !category || !workerId) throw new Error("Incomplete draft");
      const found = await workerService.listForArea(address, category);
      if (id !== requestId.current) return;
      const picked = found.find((item) => item.id === workerId);
      if (!picked) {
        // No longer qualifies (T6 rule 25): the step guard sends the user to step 5.
        useJobDraftStore.getState().patchDraft({ workerId: undefined });
        return;
      }
      const name = workerDisplayName(picked);
      rememberWorkerName(picked.id, name);
      setWorker({ state: "ready", name });
    } catch {
      if (id !== requestId.current) return;
      setWorker({ state: "error" });
    }
  }, []);

  React.useEffect(() => {
    // Once per mount (Strict Mode runs effects twice; a second request would hide a ?mockError=1 failure).
    if (!direct || startedOnMount.current) return;
    startedOnMount.current = true;
    void loadWorker();
  }, [direct, loadWorker]);

  function retryWorker() {
    setWorker({ state: "loading" });
    void loadWorker();
  }

  function focusAuthCard() {
    document.getElementById(REVIEW_AUTH_TITLE_ID)?.focus();
  }

  function onValid(output: Output) {
    autosave.cancel();
    save(output);
    if (!isCustomer) {
      // A guest has no path to Payment except through the account card.
      focusAuthCard();
      return;
    }
    completeStep(STEP);
    goToStep(stepRoute(STEP + 1));
  }

  function onBack() {
    autosave.cancel();
    save(form.getValues());
    goToStep(stepRoute(STEP - 1));
  }

  function jumpToAuth(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    document.getElementById(REVIEW_AUTH_ID)?.scrollIntoView({ block: "start" });
    document.getElementById(REVIEW_AUTH_TITLE_ID)?.focus({ preventScroll: true });
  }

  const liveDraft = { ...draft, savedAsTemplate: values.savedAsTemplate ?? false };

  return (
    <StepLayout
      as="div"
      step={STEP}
      steps={POST_JOB_STEPS}
      titleId={TITLE_ID}
      title={COPY.title}
      description={isCustomer ? COPY.descriptionCustomer : COPY.descriptionGuest}
      afterDescription={
        !isCustomer && (
          <Button asChild variant="link" size="sm" className="mt-2 lg:hidden">
            <a href={`#${REVIEW_AUTH_ID}`} onClick={jumpToAuth}>
              {COPY.jumpToAuth}
              <ArrowDown className="size-4" aria-hidden />
            </a>
          </Button>
        )
      }
      onBack={onBack}
      hideContinue
      asideWidth="wide"
      asideSticky={isCustomer}
      summary={
        <div className="flex flex-col gap-6 border-t border-border pt-8 md:border-t-0 md:pt-0">
          <ReviewAuthPanel />
          <section aria-labelledby={HELP_TITLE_ID} className="flex flex-col gap-1 md:px-2">
            <h2 id={HELP_TITLE_ID} className="text-body-sm font-semibold text-ink">
              {COPY.helpTitle}
            </h2>
            <ul className="flex flex-col">
              {COPY.helpLinks.map((link) => (
                <li key={link.id}>
                  <ExternalLink href={`${FAQ_HREF}#${link.id}`} className={helpLinkClass}>
                    {link.label}
                  </ExternalLink>
                </li>
              ))}
            </ul>
          </section>
        </div>
      }
    >
      <form
        id={REVIEW_FORM_ID}
        noValidate
        onSubmit={form.handleSubmit(onValid, focusFirstError(FIELD_ORDER, form.setFocus))}
        className="flex flex-col gap-8"
      >
        <ReviewSummary
          source={{ kind: "draft", draft: liveDraft }}
          editable
          titleId={SUMMARY_TITLE_ID}
          title={COPY.summaryTitle}
          worker={direct ? worker : undefined}
          onRetryWorker={retryWorker}
        />
        <Controller
          control={form.control}
          name="savedAsTemplate"
          render={({ field }) => (
            <SaveTemplateField
              variant="checkbox"
              checked={field.value}
              onCheckedChange={(checked) => {
                field.onChange(checked);
                if (!checked) form.clearErrors("templateName");
              }}
              nameId="templateName"
              nameProps={form.register("templateName")}
              nameError={errors.templateName?.message}
            />
          )}
        />
      </form>
    </StepLayout>
  );
}

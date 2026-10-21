"use client";

import * as React from "react";
import { useForm, useWatch, type Path } from "react-hook-form";
import type { z } from "zod";

import { StepLayout } from "@/components/flow/step-layout";
import { AddressInput, type AddressFieldValues } from "@/components/forms/address-input";
import { focusFirstError } from "@/components/forms/focus-first-error";
import { JobSummaryPanel } from "@/components/job/job-summary-panel";
import { NotifyMeForm, OUT_OF_AREA_TITLE_ID } from "@/components/job/notify-me-form";
import { useDraftAutosave } from "@/components/post-job/use-draft-autosave";
import { useStepContinue, useStepNavigation } from "@/components/post-job/use-step-navigation";
import { JOB_BUILDER_COPY, POST_JOB_STEPS } from "@/lib/constants";
import { isAddressChanged, isServedState, stateName, stepRoute } from "@/lib/job-builder";
import { selectSessionUser, useJobDraftStore, useSessionStore } from "@/lib/store";
import type { Address, JobDraft } from "@/lib/types";
import { addressSchema, locationSchema, zodResolver } from "@/lib/validation";

type Values = AddressFieldValues;
type Output = z.output<typeof locationSchema>;
type State = Values["address"]["state"];

const STEP = 3;
const TITLE_ID = "location-title";
const FIELD_ORDER = [
  "address.line1",
  "address.city",
  "address.state",
  "address.zip",
] as const satisfies readonly Path<Values>[];
const COPY = JOB_BUILDER_COPY.location;

type LiveAddress = Partial<Record<keyof Address, string | undefined>>;

/** Draft patch for the typed address; a changed address drops a picked worker (decision 15). */
function addressPatch(draft: JobDraft, address: LiveAddress | Address): Partial<JobDraft> {
  const next: Address = {
    line1: address.line1 ?? "",
    city: address.city ?? "",
    state: address.state ?? "",
    zip: address.zip ?? "",
    landmark: address.landmark || undefined,
  };
  return isAddressChanged(draft.address, next)
    ? { address: next, workerId: undefined }
    : { address: next };
}

/**
 * Step 3 Where: a US address with autocomplete and an optional landmark. A
 * valid address outside the service area shows "notify me" and does not
 * complete the step (decision 3).
 */
export function LocationStep() {
  const goToStep = useStepNavigation();
  const { nextRoute, continueLabel } = useStepContinue(STEP);
  const draft = useJobDraftStore((state) => state.draft);
  const patchDraft = useJobDraftStore((state) => state.patchDraft);
  const completeStep = useJobDraftStore((state) => state.completeStep);
  const user = useSessionStore(selectSessionUser);

  const form = useForm<Values, unknown, Output>({
    resolver: zodResolver(locationSchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {
      address: {
        line1: draft.address?.line1 ?? "",
        city: draft.address?.city ?? "",
        state: (draft.address?.state ?? "") as State,
        zip: draft.address?.zip ?? "",
        landmark: draft.address?.landmark ?? "",
      },
    },
  });
  const values = useWatch({ control: form.control });

  const save = React.useCallback(
    (next: { address?: LiveAddress }) =>
      patchDraft(addressPatch(useJobDraftStore.getState().draft, next.address ?? {})),
    [patchDraft],
  );
  const autosave = useDraftAutosave(values, save);

  const parsed = addressSchema.safeParse(values.address);
  const outOfArea = parsed.success && !isServedState(parsed.data.state) ? parsed.data : null;

  function onValid(output: Output) {
    if (!isServedState(output.address.state)) {
      document.getElementById(OUT_OF_AREA_TITLE_ID)?.focus();
      return;
    }
    autosave.cancel();
    patchDraft(addressPatch(useJobDraftStore.getState().draft, output.address));
    completeStep(STEP);
    goToStep(nextRoute());
  }

  function onBack() {
    autosave.cancel();
    save(form.getValues());
    goToStep(stepRoute(STEP - 1));
  }

  return (
    <StepLayout
      step={STEP}
      steps={POST_JOB_STEPS}
      titleId={TITLE_ID}
      title={COPY.title}
      description={COPY.description}
      onSubmit={form.handleSubmit(onValid, focusFirstError(FIELD_ORDER, form.setFocus))}
      onBack={onBack}
      continueLabel={continueLabel}
      summary={
        <JobSummaryPanel
          draft={{ ...draft, ...addressPatch(draft, values.address ?? {}) }}
          currentStep={STEP}
        />
      }
    >
      <div className="flex flex-col gap-6">
        <AddressInput form={form} />
        {outOfArea && (
          <NotifyMeForm
            key={outOfArea.state}
            address={outOfArea}
            defaultEmail={user?.role === "customer" ? user.email : undefined}
            onUseDifferentAddress={() => form.setFocus("address.line1")}
          />
        )}
        <span className="sr-only" role="status">
          {outOfArea ? JOB_BUILDER_COPY.notify.title(stateName(outOfArea.state)) : ""}
        </span>
      </div>
    </StepLayout>
  );
}

"use client";

import * as React from "react";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import type { z } from "zod";

import { StepLayout } from "@/components/flow/step-layout";
import { focusFirstError } from "@/components/forms/focus-first-error";
import { DescriptionField, type DescriptionForm } from "@/components/forms/description-field";
import { PhotoUploader } from "@/components/forms/photo-uploader";
import { JobSummaryPanel } from "@/components/job/job-summary-panel";
import {
  PriceInput,
  type PriceFormValues,
  type PriceInputForm,
} from "@/components/job/price-input";
import { useDraftAutosave } from "@/components/post-job/use-draft-autosave";
import { useStepContinue, useStepNavigation } from "@/components/post-job/use-step-navigation";
import { JOB_BUILDER_COPY, LIMITS, PHOTO_MIME_TYPES, POST_JOB_STEPS } from "@/lib/constants";
import { parseAmount, stepRoute } from "@/lib/job-builder";
import { useJobDraftStore } from "@/lib/store";
import type { JobDraft } from "@/lib/types";
import { detailsSchema, zodResolver } from "@/lib/validation";

type Values = PriceFormValues & {
  description: string;
  photos: string[];
};
type Output = z.output<typeof detailsSchema>;

const STEP = 4;
const TITLE_ID = "details-title";
const FIELD_ORDER = ["description", "amount", "hours"] as const satisfies readonly (keyof Values)[];
const COPY = JOB_BUILDER_COPY.details;

type LiveValues = Partial<{
  description: string;
  photos: (string | undefined)[];
  pricingType: Values["pricingType"];
  amount: string;
  hours: string;
}>;

/** The form's values as the schema's input: typed amounts and hours become numbers. */
function toDetailsInput(values: LiveValues) {
  const hourly = values.pricingType === "hourly";
  return {
    description: values.description ?? "",
    photos: (values.photos ?? []).filter((url): url is string => !!url),
    pricingType: values.pricingType ?? "fixed",
    amount: parseAmount(values.amount),
    hours: hourly && values.hours ? Number(values.hours) : undefined,
  };
}

/** Draft patch: only the active type's amount, and hours only for hourly (decision 9). */
function toPatch(values: LiveValues): Partial<JobDraft> {
  const input = toDetailsInput(values);
  return { ...input, description: values.description || undefined };
}

const schemaResolver = zodResolver(detailsSchema);

/** Validates the converted values; error paths (description, amount, hours) match the form's. */
const detailsResolver: Resolver<Values, unknown, Output> = (values, context, options) =>
  schemaResolver(
    toDetailsInput(values) as Parameters<typeof schemaResolver>[0],
    context,
    options as unknown as Parameters<typeof schemaResolver>[2],
  ) as ReturnType<Resolver<Values, unknown, Output>>;

/**
 * Step 4 Details: description with a live counter, optional photos (object
 * URLs, up to 5) and Fixed Price or Hourly with the live estimated total. No
 * date or time picker: jobs are on demand.
 */
export function DetailsStep() {
  const goToStep = useStepNavigation();
  const { nextRoute, continueLabel } = useStepContinue(STEP);
  const draft = useJobDraftStore((state) => state.draft);
  const patchDraft = useJobDraftStore((state) => state.patchDraft);
  const completeStep = useJobDraftStore((state) => state.completeStep);

  const form = useForm<Values, unknown, Output>({
    resolver: detailsResolver,
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {
      description: draft.description ?? "",
      photos: draft.photos ?? [],
      pricingType: draft.pricingType ?? "fixed",
      amount: draft.amount !== undefined ? String(draft.amount) : "",
      hours: draft.pricingType === "hourly" && draft.hours !== undefined ? String(draft.hours) : "",
    },
  });
  const values = useWatch({ control: form.control });

  const save = React.useCallback((next: LiveValues) => patchDraft(toPatch(next)), [patchDraft]);
  const autosave = useDraftAutosave(values, save);

  function onValid(output: Output) {
    autosave.cancel();
    patchDraft({
      description: output.description,
      photos: output.photos ?? [],
      pricingType: output.pricingType,
      amount: output.amount,
      hours: output.pricingType === "hourly" ? output.hours : undefined,
    });
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
      summary={<JobSummaryPanel draft={{ ...draft, ...toPatch(values) }} currentStep={STEP} />}
    >
      <DescriptionField form={form as unknown as DescriptionForm} />

      <Controller
        control={form.control}
        name="photos"
        render={({ field }) => (
          <PhotoUploader
            id="photos"
            label={COPY.photosLabel}
            hint={COPY.photosHint}
            note={COPY.photoNote}
            value={field.value}
            onChange={field.onChange}
            max={LIMITS.photosMax}
            accept={PHOTO_MIME_TYPES}
          />
        )}
      />

      <PriceInput form={form as unknown as PriceInputForm} />
    </StepLayout>
  );
}

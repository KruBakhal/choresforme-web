"use client";

import * as React from "react";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { z } from "zod";

import { SelectableCard } from "@/components/flow/selectable-card";
import { markStepNavigation, StepLayout } from "@/components/flow/step-layout";
import { focusFirstError } from "@/components/forms/focus-first-error";
import { FieldError, FormField } from "@/components/forms/form-field";
import { JobSummaryPanel } from "@/components/job/job-summary-panel";
import { useDraftAutosave } from "@/components/post-job/use-draft-autosave";
import { useStepNavigation } from "@/components/post-job/use-step-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CATEGORY_ICONS,
  JOB_BUILDER_COPY,
  LIMITS,
  OTHER_SUB_SERVICE,
  POST_JOB_STEPS,
} from "@/lib/constants";
import { findCategory, stepRoute } from "@/lib/job-builder";
import { useJobDraftStore } from "@/lib/store";
import type { JobDraft } from "@/lib/types";
import { servicesSchema, zodResolver } from "@/lib/validation";

type Values = z.input<typeof servicesSchema>;
type Output = z.output<typeof servicesSchema>;

const STEP = 2;
const TITLE_ID = "services-title";
const ERROR_ID = "subServices-error";
const OTHER_ID = "otherText";
const FIELD_ORDER = ["subServices", "otherText"] as const satisfies readonly (keyof Values)[];
const COPY = JOB_BUILDER_COPY.services;

function toPatch(values: {
  subServices?: (string | undefined)[];
  otherText?: string;
}): Partial<JobDraft> {
  const subServices = (values.subServices ?? []).filter((item): item is string => !!item);
  return {
    subServices,
    // The text is kept only while "Other" is selected (rule 13).
    otherText: subServices.includes(OTHER_SUB_SERVICE) ? values.otherText || undefined : undefined,
  };
}

/**
 * Step 2 Services: one or more sub-services of the chosen category. "Other"
 * opens a short text field. Custom has only "Other", pre-selected (decision 8).
 */
export function ServicesStep() {
  const goToStep = useStepNavigation();
  const draft = useJobDraftStore((state) => state.draft);
  const patchDraft = useJobDraftStore((state) => state.patchDraft);
  const completeStep = useJobDraftStore((state) => state.completeStep);
  const category = findCategory(draft.category);

  const form = useForm<Values, unknown, Output>({
    resolver: zodResolver(servicesSchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {
      category: draft.category,
      subServices: draft.subServices ?? (draft.category === "custom" ? [OTHER_SUB_SERVICE] : []),
      otherText: draft.otherText ?? "",
    },
  });
  const values = useWatch({ control: form.control });
  const { errors } = form.formState;
  const servicesError = errors.subServices?.message;
  const otherSelected = (values.subServices ?? []).includes(OTHER_SUB_SERVICE);

  const save = React.useCallback(
    (next: Parameters<typeof toPatch>[0]) => patchDraft(toPatch(next)),
    [patchDraft],
  );
  const autosave = useDraftAutosave(values, save);

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

  if (!category) return null;
  const CategoryIcon = CATEGORY_ICONS[category.id];

  return (
    <StepLayout
      step={STEP}
      steps={POST_JOB_STEPS}
      titleId={TITLE_ID}
      title={COPY.title}
      description={COPY.description}
      onSubmit={form.handleSubmit(onValid, focusFirstError(FIELD_ORDER, form.setFocus))}
      onBack={onBack}
      summary={<JobSummaryPanel draft={{ ...draft, ...toPatch(values) }} currentStep={STEP} />}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-body-sm font-semibold text-ink">
          <CategoryIcon className="size-4" aria-hidden />
          {category.name}
        </span>
        <Button asChild variant="link" size="sm">
          <Link
            href={stepRoute(1)}
            aria-label={COPY.changeLabel}
            onClick={() => {
              autosave.flush();
              markStepNavigation();
            }}
          >
            {COPY.change}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <Controller
          control={form.control}
          name="subServices"
          render={({ field }) => {
            const selected = field.value ?? [];
            return (
              <div
                role="group"
                aria-labelledby={TITLE_ID}
                aria-describedby={servicesError ? ERROR_ID : undefined}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                {category.subServices.map((service, index) => {
                  const isOther = service === OTHER_SUB_SERVICE;
                  const checked = selected.includes(service);
                  return (
                    <React.Fragment key={service}>
                      <SelectableCard
                        ref={index === 0 ? field.ref : undefined}
                        type="checkbox"
                        layout="row"
                        value={service}
                        title={service}
                        checked={checked}
                        onCheckedChange={(next) => {
                          const updated = next
                            ? category.subServices.filter(
                                (item) => item === service || selected.includes(item),
                              )
                            : selected.filter((item) => item !== service);
                          field.onChange(updated);
                          if (isOther && !next) form.clearErrors("otherText");
                        }}
                        onBlur={field.onBlur}
                        invalid={!!servicesError && !checked}
                        describedBy={servicesError ? ERROR_ID : undefined}
                        controls={isOther ? OTHER_ID : undefined}
                      />
                      {isOther && otherSelected && (
                        <FormField
                          id={OTHER_ID}
                          label={COPY.otherLabel}
                          hint={COPY.otherHint}
                          error={errors.otherText?.message}
                          className="sm:col-span-2"
                        >
                          {(control) => (
                            <Input
                              id={control.id}
                              aria-describedby={control.describedBy}
                              aria-invalid={control.invalid || undefined}
                              maxLength={LIMITS.otherTextMax}
                              autoComplete="off"
                              {...form.register("otherText")}
                            />
                          )}
                        </FormField>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            );
          }}
        />
        {servicesError && <FieldError id={ERROR_ID} message={servicesError} />}
      </div>
    </StepLayout>
  );
}

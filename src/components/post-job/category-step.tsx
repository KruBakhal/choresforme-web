"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { z } from "zod";

import { SelectableCard } from "@/components/flow/selectable-card";
import { StepLayout } from "@/components/flow/step-layout";
import { focusFirstError } from "@/components/forms/focus-first-error";
import { FieldError } from "@/components/forms/form-field";
import { JobSummaryPanel } from "@/components/job/job-summary-panel";
import { useDraftAutosave } from "@/components/post-job/use-draft-autosave";
import { useStepNavigation } from "@/components/post-job/use-step-navigation";
import { RadioGroup } from "@/components/ui/radio-group";
import {
  CATEGORIES,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_ICONS,
  JOB_BUILDER_COPY,
  POST_JOB_STEPS,
} from "@/lib/constants";
import { categoryChangePatch, stepRoute } from "@/lib/job-builder";
import { useJobDraftStore } from "@/lib/store";
import type { CategoryId } from "@/lib/types";
import { categorySchema, zodResolver } from "@/lib/validation";

type Values = z.input<typeof categorySchema>;
type Output = z.output<typeof categorySchema>;

const STEP = 1;
const TITLE_ID = "category-title";
const ERROR_ID = "category-error";
const FIELD_ORDER = ["category"] as const satisfies readonly (keyof Values)[];
const COPY = JOB_BUILDER_COPY.category;

/** Step 1 Category: exactly one of the four categories (select, then Continue). */
export function CategoryStep() {
  const router = useRouter();
  const goToStep = useStepNavigation();
  const draft = useJobDraftStore((state) => state.draft);
  const patchDraft = useJobDraftStore((state) => state.patchDraft);
  const completeStep = useJobDraftStore((state) => state.completeStep);

  const form = useForm<Values, unknown, Output>({
    resolver: zodResolver(categorySchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: { category: draft.category },
  });
  const values = useWatch({ control: form.control });
  const error = form.formState.errors.category?.message;

  const save = React.useCallback(
    (next: Partial<Values>) => {
      if (!next.category) return;
      patchDraft(categoryChangePatch(useJobDraftStore.getState().draft, next.category));
    },
    [patchDraft],
  );
  const autosave = useDraftAutosave(values, save);

  function onValid(output: Output) {
    autosave.cancel();
    save(output);
    completeStep(STEP);
    goToStep(stepRoute(STEP + 1));
  }

  function onBack() {
    autosave.cancel();
    save(form.getValues());
    router.push("/");
  }

  const liveDraft = values.category
    ? { ...draft, ...categoryChangePatch(draft, values.category) }
    : draft;

  return (
    <StepLayout
      step={STEP}
      steps={POST_JOB_STEPS}
      titleId={TITLE_ID}
      title={COPY.title}
      description={COPY.description}
      onSubmit={form.handleSubmit(onValid, focusFirstError(FIELD_ORDER, form.setFocus))}
      onBack={onBack}
      summary={<JobSummaryPanel draft={liveDraft} currentStep={STEP} />}
    >
      <div className="flex flex-col gap-4">
        <Controller
          control={form.control}
          name="category"
          render={({ field }) => (
            <RadioGroup
              name={field.name}
              value={field.value ?? ""}
              onValueChange={(value) => field.onChange(value as CategoryId)}
              aria-labelledby={TITLE_ID}
              aria-describedby={error ? ERROR_ID : undefined}
              aria-invalid={error ? true : undefined}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
            >
              {CATEGORIES.map((category, index) => {
                const focusTarget = field.value ? field.value === category.id : index === 0;
                return (
                  <SelectableCard
                    key={category.id}
                    ref={focusTarget ? field.ref : undefined}
                    type="radio"
                    layout="tile"
                    value={category.id}
                    title={category.name}
                    description={CATEGORY_DESCRIPTIONS[category.id]}
                    icon={CATEGORY_ICONS[category.id]}
                    invalid={!!error}
                    describedBy={error ? ERROR_ID : undefined}
                    onBlur={field.onBlur}
                  />
                );
              })}
            </RadioGroup>
          )}
        />
        {error && <FieldError id={ERROR_ID} message={error} />}
      </div>
    </StepLayout>
  );
}

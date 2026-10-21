"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";

import { SelectableCard } from "@/components/flow/selectable-card";
import { focusFirstError } from "@/components/forms/focus-first-error";
import { FormAlert, nextAlertKey } from "@/components/forms/form-alert";
import { FieldError } from "@/components/forms/form-field";
import { useOnboarding } from "@/components/worker-onboarding/onboarding-context";
import { OnboardingStepLayout } from "@/components/worker-onboarding/onboarding-step-layout";
import { useOnboardingNavigation } from "@/components/worker-onboarding/use-onboarding-navigation";
import {
  CATEGORIES,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_ICONS,
  WORKER_ONBOARDING_COPY,
} from "@/lib/constants";
import { workers } from "@/lib/mock/services";
import { useOnboardingStore } from "@/lib/store";
import type { CategoryId } from "@/lib/types";
import { workerServicesSchema, zodResolver } from "@/lib/validation";
import { onboardingStepRoute } from "@/lib/worker-onboarding";

type Values = z.input<typeof workerServicesSchema>;
type Output = z.output<typeof workerServicesSchema>;

const TITLE_ID = "services-title";
const ERROR_ID = "categories-error";
const FIELD_ORDER = ["categories"] as const satisfies readonly (keyof Values)[];
const COPY = WORKER_ONBOARDING_COPY.services;

/** Your services (Step 2 of 4): one or more of the four categories. */
export function ServicesStep() {
  const { user, profile, setProfile } = useOnboarding();
  const go = useOnboardingNavigation();
  const markStepComplete = useOnboardingStore((state) => state.markStepComplete);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<number | null>(null);

  const form = useForm<Values, unknown, Output>({
    resolver: zodResolver(workerServicesSchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: { categories: profile.categories },
  });
  const error = form.formState.errors.categories?.message;

  async function onValid(output: Output) {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await workers.updateOnboarding(user.id, { categories: output.categories });
      setProfile(updated);
      markStepComplete(user.id, "services");
      go(onboardingStepRoute("id"));
    } catch {
      setSaving(false);
      setSaveError(nextAlertKey());
    }
  }

  return (
    <OnboardingStepLayout
      titleId={TITLE_ID}
      title={COPY.title}
      description={COPY.description}
      onSubmit={form.handleSubmit(onValid, focusFirstError(FIELD_ORDER, form.setFocus))}
      onBack={() => go(onboardingStepRoute("area"))}
      backDisabled={saving}
      loading={saving}
      continueLabel={saving ? WORKER_ONBOARDING_COPY.actions.saving : undefined}
    >
      <div className="flex flex-col gap-4">
        <Controller
          control={form.control}
          name="categories"
          render={({ field }) => {
            const selected = (field.value ?? []) as CategoryId[];
            return (
              <div
                role="group"
                aria-labelledby={TITLE_ID}
                aria-describedby={error ? ERROR_ID : undefined}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                {CATEGORIES.map((category, index) => {
                  const checked = selected.includes(category.id);
                  return (
                    <SelectableCard
                      key={category.id}
                      ref={index === 0 ? field.ref : undefined}
                      type="checkbox"
                      layout="tile"
                      value={category.id}
                      title={category.name}
                      description={CATEGORY_DESCRIPTIONS[category.id]}
                      icon={CATEGORY_ICONS[category.id]}
                      checked={checked}
                      disabled={saving}
                      onCheckedChange={(next) =>
                        field.onChange(
                          next
                            ? CATEGORIES.filter(
                                (item) => item.id === category.id || selected.includes(item.id),
                              ).map((item) => item.id)
                            : selected.filter((id) => id !== category.id),
                        )
                      }
                      onBlur={field.onBlur}
                      invalid={!!error && !checked}
                      describedBy={error ? ERROR_ID : undefined}
                    />
                  );
                })}
              </div>
            );
          }}
        />
        {error && <FieldError id={ERROR_ID} message={error} />}
      </div>

      {saveError !== null && (
        <FormAlert key={saveError} tone="error" message={WORKER_ONBOARDING_COPY.saveError} />
      )}
    </OnboardingStepLayout>
  );
}

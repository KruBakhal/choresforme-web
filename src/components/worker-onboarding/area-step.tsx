"use client";

import * as React from "react";
import { Controller, useForm, useWatch, type Path, type UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { AddressInput, type AddressFieldValues } from "@/components/forms/address-input";
import { focusFirstError } from "@/components/forms/focus-first-error";
import { FormAlert, nextAlertKey } from "@/components/forms/form-alert";
import { AreaMapPlaceholder } from "@/components/worker/area-map-placeholder";
import { RadiusField } from "@/components/worker/radius-field";
import { useOnboarding } from "@/components/worker-onboarding/onboarding-context";
import { OnboardingStepLayout } from "@/components/worker-onboarding/onboarding-step-layout";
import { useOnboardingNavigation } from "@/components/worker-onboarding/use-onboarding-navigation";
import { LIMITS, WORKER_ONBOARDING_COPY } from "@/lib/constants";
import { isServedState, servedStatesText, stateName } from "@/lib/job-builder";
import { workers } from "@/lib/mock/services";
import { useOnboardingStore } from "@/lib/store";
import { addressSchema, workerAreaSchema, zodResolver } from "@/lib/validation";
import { onboardingStepRoute } from "@/lib/worker-onboarding";

/*
 * `AddressInput` works on a field called `address`; the area schema calls it
 * `baseAddress`. Same rules, re-keyed for the form; mapped back on save.
 */
const areaFormSchema = z.object({
  address: workerAreaSchema.shape.baseAddress,
  radiusMiles: workerAreaSchema.shape.radiusMiles,
});

type Values = z.input<typeof areaFormSchema>;
type Output = z.output<typeof areaFormSchema>;
type State = Values["address"]["state"];

const TITLE_ID = "area-title";
const RADIUS_ID = "radius";
const FIELD_ORDER = [
  "address.line1",
  "address.city",
  "address.state",
  "address.zip",
  "radiusMiles",
] as const satisfies readonly Path<Values>[];
const COPY = WORKER_ONBOARDING_COPY.area;

/**
 * Your area (Step 1 of 4): the base address (US only) and a 5–200 mile
 * radius, shown on the map placeholder. Saves with `workers.updateOnboarding`
 * on Continue. An address outside the served states is allowed, with a note.
 */
export function AreaStep() {
  const { user, profile, setProfile } = useOnboarding();
  const go = useOnboardingNavigation();
  const markStepComplete = useOnboardingStore((state) => state.markStepComplete);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<number | null>(null);

  const form = useForm<Values, unknown, Output>({
    resolver: zodResolver(areaFormSchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {
      address: {
        line1: profile.baseAddress.line1,
        city: profile.baseAddress.city,
        state: profile.baseAddress.state as State,
        zip: profile.baseAddress.zip,
        landmark: profile.baseAddress.landmark ?? "",
      },
      radiusMiles: profile.radiusMiles || LIMITS.radiusDefault,
    },
  });
  const address = useWatch({ control: form.control, name: "address" });
  const radiusMiles = useWatch({ control: form.control, name: "radiusMiles" });

  const parsed = addressSchema.safeParse(address);
  const placed = parsed.success ? parsed.data : undefined;
  const outOfArea = placed && !isServedState(placed.state) ? placed : null;

  async function onValid(output: Output) {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await workers.updateOnboarding(user.id, {
        baseAddress: output.address,
        radiusMiles: output.radiusMiles,
      });
      setProfile(updated);
      markStepComplete(user.id, "area");
      go(onboardingStepRoute("services"));
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
      loading={saving}
      continueLabel={saving ? WORKER_ONBOARDING_COPY.actions.saving : undefined}
    >
      <section aria-labelledby="area-address-title" className="flex flex-col gap-6">
        <h2 id="area-address-title" className="text-h4 font-semibold text-ink">
          {COPY.addressHeading}
        </h2>
        <fieldset disabled={saving} className="min-w-0">
          <AddressInput
            form={form as unknown as UseFormReturn<AddressFieldValues, unknown, Output>}
          />
        </fieldset>
        {outOfArea && (
          <FormAlert
            key={outOfArea.state}
            tone="info"
            autoFocus={false}
            title={COPY.outOfAreaTitle(stateName(outOfArea.state))}
            message={COPY.outOfAreaBody(servedStatesText())}
          />
        )}
      </section>

      <section aria-labelledby="area-radius-title" className="flex flex-col gap-4">
        <h2 id="area-radius-title" className="text-h4 font-semibold text-ink">
          {COPY.radiusHeading}
        </h2>
        <AreaMapPlaceholder address={placed} radiusMiles={radiusMiles} />
        <Controller
          control={form.control}
          name="radiusMiles"
          render={({ field, fieldState }) => (
            <RadiusField
              ref={field.ref}
              id={RADIUS_ID}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              disabled={saving}
            />
          )}
        />
      </section>

      {saveError !== null && (
        <FormAlert key={saveError} tone="error" message={WORKER_ONBOARDING_COPY.saveError} />
      )}
    </OnboardingStepLayout>
  );
}

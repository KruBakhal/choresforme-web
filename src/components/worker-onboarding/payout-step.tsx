"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { focusFirstError } from "@/components/forms/focus-first-error";
import { FormAlert, nextAlertKey } from "@/components/forms/form-alert";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocumentStatusPanel } from "@/components/worker-onboarding/document-status-panel";
import { useOnboarding } from "@/components/worker-onboarding/onboarding-context";
import { OnboardingStepLayout } from "@/components/worker-onboarding/onboarding-step-layout";
import { SeeJobsLink, SkipRow } from "@/components/worker-onboarding/step-links";
import { useOnboardingNavigation } from "@/components/worker-onboarding/use-onboarding-navigation";
import { LIMITS, ROLE_HOME, WORKER_ONBOARDING_COPY } from "@/lib/constants";
import { workers } from "@/lib/mock/services";
import { useOnboardingStore } from "@/lib/store";
import { payoutSchema, zodResolver } from "@/lib/validation";
import { onboardingStepRoute } from "@/lib/worker-onboarding";

type Values = z.input<typeof payoutSchema>;
type Output = z.output<typeof payoutSchema>;

const TITLE_ID = "payout-title";
const FIELD_ORDER = ["routingNumber", "accountNumber"] as const satisfies readonly (keyof Values)[];
const COPY = WORKER_ONBOARDING_COPY.payout;
const ACTIONS = WORKER_ONBOARDING_COPY.actions;
const PANEL = WORKER_ONBOARDING_COPY.statusPanel;

/**
 * Payout account (not counted in "of 4"): routing and account number, UI
 * only (T9 decision 3). The numbers are validated, then discarded; only
 * `payoutAdded: true` is saved. They are never shown again or pre-filled.
 */
export function PayoutStep() {
  const { user, profile, setProfile } = useOnboarding();
  const go = useOnboardingNavigation();
  const markStepComplete = useOnboardingStore((state) => state.markStepComplete);
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<number | null>(null);
  const showFields = !profile.payoutAdded || editing;

  const form = useForm<Values, unknown, Output>({
    resolver: zodResolver(payoutSchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: { routingNumber: "", accountNumber: "" },
  });
  const { errors } = form.formState;

  React.useEffect(() => {
    if (editing) form.setFocus("routingNumber");
  }, [editing, form]);

  async function onValid() {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await workers.updateOnboarding(user.id, { payoutAdded: true });
      setProfile(updated);
      markStepComplete(user.id, "payout");
      go(ROLE_HOME.worker, { focusHeading: false });
    } catch {
      setSaving(false);
      setSaveError(nextAlertKey());
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!showFields) {
      event.preventDefault();
      go(ROLE_HOME.worker, { focusHeading: false });
      return;
    }
    void form.handleSubmit(onValid, focusFirstError(FIELD_ORDER, form.setFocus))(event);
  }

  return (
    <OnboardingStepLayout
      titleId={TITLE_ID}
      title={COPY.title}
      description={COPY.description}
      afterDescription={<SeeJobsLink />}
      onSubmit={onSubmit}
      onBack={() => go(onboardingStepRoute("insurance"))}
      backDisabled={saving}
      loading={saving}
      continueLabel={!showFields ? ACTIONS.continue : saving ? ACTIONS.saving : ACTIONS.addPayout}
    >
      {profile.payoutAdded && (
        <DocumentStatusPanel
          id="payout-status"
          title={PANEL.payoutTitle}
          status="done"
          message={PANEL.payoutAdded}
          action={
            !editing && (
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
                {PANEL.updatePayout}
              </Button>
            )
          }
        />
      )}

      {showFields && (
        <>
          <FormAlert tone="info" autoFocus={false} title={COPY.demoTitle} message={COPY.demoNote} />
          <fieldset disabled={saving} className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              id="routingNumber"
              label={COPY.routingLabel}
              hint={COPY.routingHint}
              error={errors.routingNumber?.message}
            >
              {(control) => (
                <Input
                  id={control.id}
                  aria-describedby={control.describedBy}
                  aria-invalid={control.invalid || undefined}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={LIMITS.routingNumberLength}
                  className="tabular-nums"
                  {...form.register("routingNumber")}
                />
              )}
            </FormField>
            <FormField
              id="accountNumber"
              label={COPY.accountLabel}
              hint={COPY.accountHint}
              error={errors.accountNumber?.message}
            >
              {(control) => (
                <Input
                  id={control.id}
                  aria-describedby={control.describedBy}
                  aria-invalid={control.invalid || undefined}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={LIMITS.accountNumberMax}
                  className="tabular-nums"
                  {...form.register("accountNumber")}
                />
              )}
            </FormField>
          </fieldset>
        </>
      )}

      {saveError !== null && (
        <FormAlert key={saveError} tone="error" message={WORKER_ONBOARDING_COPY.saveError} />
      )}

      {!profile.payoutAdded && (
        <SkipRow
          note={COPY.skipNote}
          href={ROLE_HOME.worker}
          disabled={saving}
          focusHeading={false}
        />
      )}
    </OnboardingStepLayout>
  );
}

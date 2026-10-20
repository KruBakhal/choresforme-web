"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";

import { DobField } from "@/components/auth/dob-field";
import { MobileVerifyField } from "@/components/auth/mobile-verify-field";
import {
  mobileVerifiedResolver,
  type WithMobileVerified,
} from "@/components/auth/mobile-verified-resolver";
import { TermsField } from "@/components/auth/terms-field";
import { FormAlertFromData, nextAlertKey, type FormAlertData } from "@/components/forms/form-alert";
import { focusFirstError } from "@/components/forms/focus-first-error";
import { Button } from "@/components/ui/button";
import { isServiceError, users } from "@/lib/mock/services";
import { AUTH_COPY, SERVICE_MESSAGES } from "@/lib/constants";
import type { User } from "@/lib/types";
import { completeProfileSchema } from "@/lib/validation";

type CompleteProfileValues = WithMobileVerified<z.input<typeof completeProfileSchema>>;
type CompleteProfileOutput = z.output<typeof completeProfileSchema>;

/** The form's fields in DOM order: the first invalid one gets focus. */
const FIELD_ORDER = [
  "mobile",
  "dob",
  "terms",
] as const satisfies readonly (keyof CompleteProfileValues)[];

type CompleteProfileFormProps = {
  user: User;
  /** Called once the profile is saved (the session is then complete). */
  onSuccess: (user: User) => void;
  onPendingChange?: (pending: boolean) => void;
  onAlertChange?: (alert: FormAlertData | null) => void;
};

/**
 * Finishes a new Google or Facebook user (decision 2): mobile with OTP, date
 * of birth and Terms. Saved with `users.update`.
 */
export function CompleteProfileForm({
  user,
  onSuccess,
  onPendingChange,
  onAlertChange,
}: CompleteProfileFormProps) {
  const [submitting, setSubmitting] = React.useState(false);
  const [ownAlert, setOwnAlert] = React.useState<{ data: FormAlertData; key: number } | null>(null);

  const form = useForm<CompleteProfileValues, unknown, CompleteProfileOutput>({
    resolver: mobileVerifiedResolver(completeProfileSchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {
      role: user.role,
      mobile: "",
      dob: user.dob,
      terms: false,
      mobileVerified: false,
    },
  });
  const { errors, isSubmitted } = form.formState;

  function showAlert(alert: FormAlertData | null) {
    if (onAlertChange) onAlertChange(alert);
    else setOwnAlert(alert ? { data: alert, key: nextAlertKey() } : null);
  }

  async function onValid(values: CompleteProfileOutput) {
    showAlert(null);
    setSubmitting(true);
    onPendingChange?.(true);
    try {
      // The number was verified inline before submit (decision 1).
      const updated = await users.update(user.id, {
        mobile: values.mobile,
        dob: values.dob,
        phoneVerified: true,
      });
      onSuccess(updated);
    } catch (caught) {
      setSubmitting(false);
      onPendingChange?.(false);
      showAlert({
        tone: "error",
        message: isServiceError(caught) ? caught.message : SERVICE_MESSAGES.mockError,
      });
    }
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onValid, focusFirstError(FIELD_ORDER, form.setFocus))}
    >
      <fieldset disabled={submitting} className="contents">
        {ownAlert && (
          <div className="mb-6">
            <FormAlertFromData key={ownAlert.key} alert={ownAlert.data} />
          </div>
        )}
        <div className="flex flex-col gap-6">
          <Controller
            control={form.control}
            name="mobile"
            render={({ field, fieldState }) => (
              <MobileVerifyField
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                focusRef={field.ref}
                error={fieldState.error?.message}
                nextFocusId="dob"
                disabled={submitting}
                onVerifiedChange={(verified) => {
                  form.setValue("mobileVerified", verified);
                  if (isSubmitted || fieldState.error) void form.trigger("mobile");
                }}
              />
            )}
          />

          <DobField role={user.role} error={errors.dob?.message} {...form.register("dob")} />

          <Controller
            control={form.control}
            name="terms"
            render={({ field, fieldState }) => (
              <TermsField
                ref={field.ref}
                checked={field.value}
                onCheckedChange={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />

          <Button type="submit" className="w-full" loading={submitting}>
            {submitting ? AUTH_COPY.completeProfile.submitting : AUTH_COPY.completeProfile.submit}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}

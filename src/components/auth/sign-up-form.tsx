"use client";

import * as React from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";

import { DobField } from "@/components/auth/dob-field";
import { MobileVerifyField } from "@/components/auth/mobile-verify-field";
import {
  mobileVerifiedResolver,
  type WithMobileVerified,
} from "@/components/auth/mobile-verified-resolver";
import { PasswordInput } from "@/components/auth/password-input";
import { ROLE_ICONS } from "@/components/auth/role-picker";
import { TermsField } from "@/components/auth/terms-field";
import { FormAlertFromData, nextAlertKey, type FormAlertData } from "@/components/forms/form-alert";
import { FormField } from "@/components/forms/form-field";
import { focusFirstError } from "@/components/forms/focus-first-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth, isServiceError } from "@/lib/mock/services";
import { AUTH_COPY, AUTH_ROUTES, SERVICE_MESSAGES } from "@/lib/constants";
import type { Role, SignUpInput, User } from "@/lib/types";
import { signUpSchema } from "@/lib/validation";

type SignUpValues = WithMobileVerified<z.input<typeof signUpSchema>>;

/** The form's fields in DOM order: the first invalid one gets focus. */
const FIELD_ORDER = [
  "firstName",
  "lastName",
  "email",
  "password",
  "mobile",
  "dob",
  "terms",
] as const satisfies readonly (keyof SignUpValues)[];

type RoleChipProps = {
  role: Role;
  /** "Change" link back to the picker; omitted when the role is fixed. */
  changeHref?: string;
};

/** "Customer account" / "Worker account" chip, with an optional Change link. */
export function RoleChip({ role, changeHref }: RoleChipProps) {
  const Icon = ROLE_ICONS[role];
  return (
    <div className="flex flex-wrap items-center gap-x-3">
      <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-body-sm font-semibold text-ink">
        <Icon className="size-4" aria-hidden />
        {AUTH_COPY.signUp.roleChip[role]}
      </span>
      {changeHref && (
        <Button asChild variant="link" size="sm">
          <Link href={changeHref} aria-label={AUTH_COPY.signUp.changeLabel}>
            {AUTH_COPY.signUp.change}
          </Link>
        </Button>
      )}
    </div>
  );
}

type SignUpFormProps = {
  role: Role;
  /** Called once the account exists and the session has started. Never redirects itself. */
  onSuccess: (user: User) => void;
  onPendingChange?: (pending: boolean) => void;
  /** Lets the page show the service alert above the whole card body. */
  onAlertChange?: (alert: FormAlertData | null) => void;
  /** "Log in" link for "You already have an account — log in" (keeps `next`). */
  logInHref?: string;
  /** When set, the alert's "Log in" switches the inline form instead of linking (T7). */
  onLogInInstead?: () => void;
  disabled?: boolean;
};

/**
 * Email sign-up for one role (PRD): name, email, password, mobile with
 * inline SMS verification, date of birth and one Terms checkbox. Workers
 * must be 18 or older.
 */
export function SignUpForm({
  role,
  onSuccess,
  onPendingChange,
  onAlertChange,
  logInHref = AUTH_ROUTES.login,
  onLogInInstead,
  disabled = false,
}: SignUpFormProps) {
  const [submitting, setSubmitting] = React.useState(false);
  const [ownAlert, setOwnAlert] = React.useState<{ data: FormAlertData; key: number } | null>(null);

  const form = useForm<SignUpValues, unknown, SignUpInput>({
    resolver: mobileVerifiedResolver(signUpSchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {
      role,
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      mobile: "",
      dob: "",
      terms: false,
      mobileVerified: false,
    },
  });
  const { errors, isSubmitted } = form.formState;

  function showAlert(alert: FormAlertData | null) {
    if (onAlertChange) onAlertChange(alert);
    else setOwnAlert(alert ? { data: alert, key: nextAlertKey() } : null);
  }

  async function onValid(values: SignUpInput) {
    showAlert(null);
    setSubmitting(true);
    onPendingChange?.(true);
    try {
      const user = await auth.signUp({ ...values, role });
      onSuccess(user);
    } catch (caught) {
      setSubmitting(false);
      onPendingChange?.(false);
      if (isServiceError(caught) && caught.code === "ACCOUNT_EXISTS") {
        // PRD: "instead of an error". The email is not put in the URL.
        showAlert({
          tone: "info",
          message: SERVICE_MESSAGES.accountExists,
          action: onLogInInstead
            ? { label: AUTH_COPY.signUp.logIn, onClick: onLogInInstead }
            : { label: AUTH_COPY.signUp.logIn, href: logInHref },
        });
      } else {
        showAlert({
          tone: "error",
          message: isServiceError(caught) ? caught.message : SERVICE_MESSAGES.mockError,
        });
      }
    }
  }

  const busy = submitting || disabled;

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onValid, focusFirstError(FIELD_ORDER, form.setFocus))}
    >
      <fieldset disabled={busy} className="contents">
        {ownAlert && (
          <div className="mb-6">
            <FormAlertFromData key={ownAlert.key} alert={ownAlert.data} />
          </div>
        )}
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-4">
            <FormField
              id="firstName"
              label={AUTH_COPY.fields.firstName}
              error={errors.firstName?.message}
            >
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  autoComplete="given-name"
                  aria-describedby={describedBy}
                  aria-invalid={invalid || undefined}
                  aria-required="true"
                  {...form.register("firstName")}
                />
              )}
            </FormField>
            <FormField
              id="lastName"
              label={AUTH_COPY.fields.lastName}
              error={errors.lastName?.message}
            >
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  autoComplete="family-name"
                  aria-describedby={describedBy}
                  aria-invalid={invalid || undefined}
                  aria-required="true"
                  {...form.register("lastName")}
                />
              )}
            </FormField>
          </div>

          <FormField id="signup-email" label={AUTH_COPY.fields.email} error={errors.email?.message}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="email"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                aria-describedby={describedBy}
                aria-invalid={invalid || undefined}
                aria-required="true"
                {...form.register("email")}
              />
            )}
          </FormField>

          <FormField
            id="signup-password"
            label={AUTH_COPY.fields.password}
            hint={AUTH_COPY.fields.passwordHint}
            error={errors.password?.message}
          >
            {({ id, describedBy, invalid }) => (
              <PasswordInput
                id={id}
                autoComplete="new-password"
                aria-describedby={describedBy}
                aria-invalid={invalid || undefined}
                aria-required="true"
                {...form.register("password")}
              />
            )}
          </FormField>

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
                disabled={busy}
                onVerifiedChange={(verified) => {
                  form.setValue("mobileVerified", verified);
                  if (isSubmitted || fieldState.error) void form.trigger("mobile");
                }}
              />
            )}
          />

          <DobField role={role} error={errors.dob?.message} {...form.register("dob")} />

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

          <Button
            type="submit"
            className="h-auto min-h-12 w-full py-3 text-center whitespace-normal"
            loading={submitting}
          >
            {submitting ? AUTH_COPY.signUp.submitting : AUTH_COPY.signUp.submit[role]}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}

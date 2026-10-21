"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { PasswordInput } from "@/components/auth/password-input";
import { FormAlertFromData, nextAlertKey, type FormAlertData } from "@/components/forms/form-alert";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth, isServiceError } from "@/lib/mock/services";
import { AUTH_COPY, AUTH_ROUTES, SERVICE_MESSAGES } from "@/lib/constants";
import type { User } from "@/lib/types";
import { loginSchema, zodResolver } from "@/lib/validation";

type LoginValues = z.input<typeof loginSchema>;

export type LoginFormHandle = {
  /** Fills both fields and submits (the Demo accounts panel). */
  submitWith: (email: string, password: string) => void;
};

type LoginFormProps = {
  /** Called once the session has started. The form never redirects itself. */
  onSuccess: (user: User) => void;
  onPendingChange?: (pending: boolean) => void;
  /**
   * Receives the service alert so the page can show it above the whole card
   * body. Without it, the form shows the alert above its own fields.
   */
  onAlertChange?: (alert: FormAlertData | null) => void;
  /** Sign up link in the "No account found" alert (keeps `next`). */
  signUpHref?: string;
  /** When set, the alert's "Sign up" switches the inline form instead of linking (T7). */
  onSignUpInstead?: () => void;
  /** "Forgot password?" target (keeps `next`). */
  forgotPasswordHref?: string;
  disabled?: boolean;
  ref?: React.Ref<LoginFormHandle>;
};

/** Email and password login. Any password works in the demo; unknown emails get "No account found". */
export function LoginForm({
  onSuccess,
  onPendingChange,
  onAlertChange,
  signUpHref = AUTH_ROUTES.signUp,
  onSignUpInstead,
  forgotPasswordHref = AUTH_ROUTES.forgotPassword,
  disabled = false,
  ref,
}: LoginFormProps) {
  const [submitting, setSubmitting] = React.useState(false);
  const [ownAlert, setOwnAlert] = React.useState<{ data: FormAlertData; key: number } | null>(null);

  const form = useForm<LoginValues, unknown, z.output<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });
  const { errors } = form.formState;

  function showAlert(alert: FormAlertData | null) {
    if (onAlertChange) onAlertChange(alert);
    else setOwnAlert(alert ? { data: alert, key: nextAlertKey() } : null);
  }

  async function onValid(values: z.output<typeof loginSchema>) {
    showAlert(null);
    setSubmitting(true);
    onPendingChange?.(true);
    try {
      const user = await auth.login(values.email, values.password);
      // Keep the spinner while the page navigates.
      onSuccess(user);
    } catch (caught) {
      setSubmitting(false);
      onPendingChange?.(false);
      if (isServiceError(caught) && caught.code === "NO_ACCOUNT") {
        showAlert({
          tone: "error",
          message: SERVICE_MESSAGES.noAccount,
          action: onSignUpInstead
            ? { label: AUTH_COPY.login.signUpLink, onClick: onSignUpInstead }
            : { label: AUTH_COPY.login.signUpLink, href: signUpHref },
        });
      } else {
        showAlert({
          tone: "error",
          message: isServiceError(caught) ? caught.message : SERVICE_MESSAGES.mockError,
        });
      }
    }
  }

  const submit = form.handleSubmit(onValid);

  React.useImperativeHandle(
    ref,
    () => ({
      submitWith: (email, password) => {
        form.setValue("email", email);
        form.setValue("password", password);
        form.clearErrors();
        void submit();
      },
    }),
    [form, submit],
  );

  const busy = submitting || disabled;

  return (
    <form noValidate onSubmit={submit}>
      <fieldset disabled={busy} className="contents">
        {ownAlert && (
          <div className="mb-6">
            <FormAlertFromData key={ownAlert.key} alert={ownAlert.data} />
          </div>
        )}
        <div className="flex flex-col gap-6">
          <FormField id="login-email" label={AUTH_COPY.fields.email} error={errors.email?.message}>
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
            id="login-password"
            label={AUTH_COPY.fields.password}
            error={errors.password?.message}
            after={
              <div className="flex justify-end">
                <Button asChild variant="link" size="sm">
                  <Link href={forgotPasswordHref}>{AUTH_COPY.login.forgotLink}</Link>
                </Button>
              </div>
            }
          >
            {({ id, describedBy, invalid }) => (
              <PasswordInput
                id={id}
                autoComplete="current-password"
                aria-describedby={describedBy}
                aria-invalid={invalid || undefined}
                aria-required="true"
                {...form.register("password")}
              />
            )}
          </FormField>

          <Button type="submit" className="mt-2 w-full" loading={submitting}>
            {submitting ? AUTH_COPY.login.submitting : AUTH_COPY.login.submit}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}

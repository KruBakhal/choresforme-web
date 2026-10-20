"use client";

import * as React from "react";
import Link from "next/link";
import { flushSync } from "react-dom";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { AuthCard } from "@/components/auth/auth-card";
import { FormAlert, nextAlertKey } from "@/components/forms/form-alert";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth, isServiceError } from "@/lib/mock/services";
import { AUTH_COPY, AUTH_ROUTES, SERVICE_MESSAGES } from "@/lib/constants";
import { forgotPasswordSchema, zodResolver } from "@/lib/validation";

type ForgotValues = z.input<typeof forgotPasswordSchema>;
type ForgotOutput = z.output<typeof forgotPasswordSchema>;

const TITLE_ID = "forgot-title";
const EMAIL_ID = "forgot-email";

type ForgotPasswordFormProps = {
  /** "Back to log in" target (keeps `next`). */
  logInHref?: string;
};

/** Email form, then "Check your email" (always succeeds for a valid email). */
export function ForgotPasswordForm({ logInHref = AUTH_ROUTES.login }: ForgotPasswordFormProps) {
  const [view, setView] = React.useState<"form" | "sent">("form");
  const [sentTo, setSentTo] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [alert, setAlert] = React.useState<{ message: string; key: number } | null>(null);

  const form = useForm<ForgotValues, unknown, ForgotOutput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });
  const { errors } = form.formState;

  async function onValid(values: ForgotOutput) {
    setAlert(null);
    setSubmitting(true);
    try {
      await auth.requestPasswordReset(values.email);
      flushSync(() => {
        setSubmitting(false);
        setSentTo(values.email);
        setView("sent");
      });
      document.getElementById(TITLE_ID)?.focus();
    } catch (caught) {
      setSubmitting(false);
      setAlert({
        message: isServiceError(caught) ? caught.message : SERVICE_MESSAGES.mockError,
        key: nextAlertKey(),
      });
    }
  }

  function showFormAgain() {
    flushSync(() => setView("form"));
    document.getElementById(EMAIL_ID)?.focus();
  }

  if (view === "sent") {
    return (
      <div className="w-full md:rounded-lg md:border md:border-border md:bg-surface md:p-8 xl:p-12">
        <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft">
          <MailCheck className="size-6 text-ink" aria-hidden />
        </span>
        <h1
          id={TITLE_ID}
          tabIndex={-1}
          className="mt-4 text-h3 outline-none focus-visible:outline-2 md:text-h2"
        >
          {AUTH_COPY.forgot.successTitle}
        </h1>
        <p className="mt-2 text-body text-ink-muted">
          {AUTH_COPY.forgot.successBodyLead}{" "}
          <span className="font-semibold break-all text-ink">{sentTo}</span>
          {AUTH_COPY.forgot.successBodyTail}
        </p>
        <p className="mt-2 text-body-sm text-ink-muted">{AUTH_COPY.forgot.demoNote}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="w-full sm:w-auto">
            <Link href={logInHref}>{AUTH_COPY.forgot.backToLogin}</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={showFormAgain}
          >
            {AUTH_COPY.forgot.differentEmail}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AuthCard
      titleId={TITLE_ID}
      title={AUTH_COPY.forgot.title}
      description={AUTH_COPY.forgot.description}
      alert={alert && <FormAlert key={alert.key} tone="error" message={alert.message} />}
      footer={
        <Button asChild variant="link" size="sm">
          <Link href={logInHref}>
            <ArrowLeft className="size-4" aria-hidden />
            {AUTH_COPY.forgot.backToLogin}
          </Link>
        </Button>
      }
    >
      <form noValidate onSubmit={form.handleSubmit(onValid)}>
        <fieldset disabled={submitting} className="contents">
          <div className="flex flex-col gap-6">
            <FormField id={EMAIL_ID} label={AUTH_COPY.fields.email} error={errors.email?.message}>
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
            <Button type="submit" className="w-full" loading={submitting}>
              {submitting ? AUTH_COPY.forgot.submitting : AUTH_COPY.forgot.submit}
            </Button>
          </div>
        </fieldset>
      </form>
    </AuthCard>
  );
}

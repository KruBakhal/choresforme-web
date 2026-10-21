"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { CircleCheck, CircleDashed, Pencil } from "lucide-react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import type { z } from "zod";

import { DobField } from "@/components/auth/dob-field";
import {
  mobileVerifiedResolver,
  type WithMobileVerified,
} from "@/components/auth/mobile-verified-resolver";
import { formatUsMobile, MobileVerifyField } from "@/components/auth/mobile-verify-field";
import { focusFirstError } from "@/components/forms/focus-first-error";
import { FormAlert, nextAlertKey } from "@/components/forms/form-alert";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUTH_COPY, DASHBOARD_COPY, SERVICE_MESSAGES } from "@/lib/constants";
import { formatDate, workerInitials } from "@/lib/job-builder";
import { isServiceError, users } from "@/lib/mock/services";
import type { User, UserPatch } from "@/lib/types";
import { mobileSchema, profileSchema } from "@/lib/validation";

type Values = WithMobileVerified<z.input<typeof profileSchema>>;
type Output = z.output<typeof profileSchema>;

const COPY = DASHBOARD_COPY.account;
const TITLE_ID = "profile-title";
const EDIT_BUTTON_ID = "profile-edit";
const FIELD_ORDER = ["firstName", "lastName", "email", "mobile", "dob"] as const;

/** Same number after normalising (+1XXXXXXXXXX). */
function isSameMobile(typed: string, saved: string): boolean {
  const parsed = mobileSchema.safeParse(typed);
  return parsed.success && parsed.data === saved;
}

/** "1988-06-14" as a local calendar date (no time-zone shift). */
const formatDob = (dob: string) => (dob ? formatDate(`${dob}T00:00:00`) : "");

/**
 * Account → Profile (T8 decision 7): view mode, then an in-place edit with
 * the sign-up rules. A changed mobile must be verified with the SMS code
 * before Save; an unchanged one never needs it (open question 9).
 */
export function ProfileSection({ user }: { user: User }) {
  const [editing, setEditing] = React.useState(false);
  const [savedKey, setSavedKey] = React.useState(0);

  function closeEditor(saved: boolean) {
    flushSync(() => {
      setEditing(false);
      setSavedKey(saved ? nextAlertKey() : 0);
    });
    if (!saved) document.getElementById(EDIT_BUTTON_ID)?.focus();
  }

  return (
    <section
      id="profile"
      aria-labelledby={TITLE_ID}
      className="rounded-lg border border-border bg-surface p-4 md:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id={TITLE_ID}
          tabIndex={-1}
          className="text-h4 font-semibold text-ink outline-none focus-visible:outline-2"
        >
          {COPY.profileTitle}
        </h2>
        {!editing && (
          <Button
            id={EDIT_BUTTON_ID}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSavedKey(0);
              setEditing(true);
            }}
          >
            <Pencil aria-hidden />
            {COPY.editProfile}
          </Button>
        )}
      </div>
      {editing ? (
        <ProfileForm user={user} onClose={closeEditor} />
      ) : (
        <ProfileView user={user} savedKey={savedKey} />
      )}
    </section>
  );
}

function ProfileView({ user, savedKey }: { user: User; savedKey: number }) {
  const chip =
    "ml-2 inline-flex items-center gap-1 rounded-full border border-input bg-surface px-2 py-1 align-middle text-caption font-semibold text-ink";
  return (
    <>
      {savedKey > 0 && (
        <FormAlert key={savedKey} tone="success" message={COPY.profileSaved} className="mt-4" />
      )}
      <div className="mt-4 flex items-center gap-4">
        <span
          aria-hidden
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-body font-semibold text-ink"
        >
          {workerInitials(user)}
        </span>
        <div className="min-w-0">
          <p className="text-body font-semibold break-words text-ink">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-body-sm text-ink-muted">{COPY.roleLine}</p>
        </div>
      </div>
      <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <div>
          <dt className="text-body-sm font-semibold text-ink">{COPY.labels.email}</dt>
          <dd className="mt-1 text-body break-all text-ink">{user.email}</dd>
        </div>
        <div>
          <dt className="text-body-sm font-semibold text-ink">{COPY.labels.mobile}</dt>
          <dd className="mt-1 text-body text-ink">
            {user.mobile ? formatUsMobile(user.mobile) : "—"}
            {user.mobile && (
              <span className={chip}>
                {user.phoneVerified ? (
                  <CircleCheck className="size-4 text-success" aria-hidden />
                ) : (
                  <CircleDashed className="size-4 text-ink-muted" aria-hidden />
                )}
                {user.phoneVerified ? COPY.verified : COPY.notVerified}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-body-sm font-semibold text-ink">{COPY.labels.dob}</dt>
          <dd className="mt-1 text-body text-ink">{formatDob(user.dob)}</dd>
        </div>
        <div>
          <dt className="text-body-sm font-semibold text-ink">{COPY.labels.signedInWith}</dt>
          <dd className="mt-1 text-body text-ink">{COPY.providers[user.authProvider]}</dd>
        </div>
      </dl>
    </>
  );
}

function ProfileForm({ user, onClose }: { user: User; onClose: (saved: boolean) => void }) {
  const [saving, setSaving] = React.useState(false);
  const [alertKey, setAlertKey] = React.useState(0);

  const resolver = React.useMemo<Resolver<Values, unknown, Output>>(() => {
    const base = mobileVerifiedResolver(profileSchema);
    // An unchanged number counts as verified (it is the saved one).
    return (values, context, options) =>
      base(
        {
          ...values,
          mobileVerified: values.mobileVerified || isSameMobile(values.mobile, user.mobile),
        },
        context,
        options,
      );
  }, [user.mobile]);

  const form = useForm<Values, unknown, Output>({
    resolver,
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile ? formatUsMobile(user.mobile) : "",
      dob: user.dob,
      mobileVerified: user.phoneVerified,
    },
  });
  const { errors, isSubmitted } = form.formState;

  // Opening the editor moves focus to First name.
  React.useEffect(() => {
    form.setFocus("firstName");
  }, [form]);

  async function onValid(output: Output) {
    if (saving) return;
    setSaving(true);
    setAlertKey(0);
    const mobileChanged = output.mobile !== user.mobile;
    const patch: UserPatch = {
      firstName: output.firstName,
      lastName: output.lastName,
      email: output.email,
      mobile: output.mobile,
      dob: output.dob,
      // The resolver only lets a changed number through once it is verified.
      ...(mobileChanged ? { phoneVerified: true } : {}),
    };
    try {
      await users.update(user.id, patch);
      onClose(true);
    } catch (caught) {
      setSaving(false);
      if (isServiceError(caught) && caught.code === "ACCOUNT_EXISTS") {
        form.setError("email", { type: "server", message: COPY.emailTaken });
        form.setFocus("email");
        return;
      }
      setAlertKey(nextAlertKey());
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    void form.handleSubmit(onValid, focusFirstError(FIELD_ORDER, form.setFocus))(event);
  }

  const inputProps = (invalid: boolean, describedBy: string | undefined) => ({
    "aria-describedby": describedBy,
    "aria-invalid": invalid || undefined,
    "aria-required": true,
    readOnly: saving,
  });

  return (
    <form noValidate onSubmit={onSubmit} className="mt-4 flex flex-col gap-6">
      {alertKey > 0 && (
        <FormAlert key={alertKey} tone="error" message={SERVICE_MESSAGES.mockError} />
      )}
      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
        <FormField
          id="firstName"
          label={AUTH_COPY.fields.firstName}
          error={errors.firstName?.message}
        >
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              autoComplete="given-name"
              {...inputProps(invalid, describedBy)}
              {...form.register("firstName")}
            />
          )}
        </FormField>
        <FormField id="lastName" label={AUTH_COPY.fields.lastName} error={errors.lastName?.message}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              autoComplete="family-name"
              {...inputProps(invalid, describedBy)}
              {...form.register("lastName")}
            />
          )}
        </FormField>
      </div>
      <FormField id="email" label={AUTH_COPY.fields.email} error={errors.email?.message}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            type="email"
            autoComplete="email"
            {...inputProps(invalid, describedBy)}
            {...form.register("email")}
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
            disabled={saving}
            initiallyVerified={user.phoneVerified && !!user.mobile}
            onVerifiedChange={(verified) => {
              form.setValue("mobileVerified", verified);
              if (isSubmitted || fieldState.error) void form.trigger("mobile");
            }}
          />
        )}
      />
      <DobField
        role="customer"
        error={errors.dob?.message}
        readOnly={saving}
        {...form.register("dob")}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" disabled={saving} onClick={() => onClose(false)}>
          {COPY.cancel}
        </Button>
        <Button type="submit" loading={saving}>
          {saving ? COPY.saving : COPY.save}
        </Button>
      </div>
    </form>
  );
}

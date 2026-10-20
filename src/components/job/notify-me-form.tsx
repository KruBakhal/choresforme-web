"use client";

import * as React from "react";
import { CircleCheck, MapPinOff } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { FieldError, FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JOB_BUILDER_COPY, SERVICE_MESSAGES } from "@/lib/constants";
import { servedStatesText, stateName } from "@/lib/job-builder";
import { isServiceError, notify } from "@/lib/mock/services";
import type { Address } from "@/lib/types";
import { notifyMeSchema, zodResolver } from "@/lib/validation";

type Values = z.input<typeof notifyMeSchema>;
type Output = z.output<typeof notifyMeSchema>;

type NotifyMeFormProps = {
  /** A valid address outside the service area. */
  address: Address;
  /** The signed-in customer's email, if any. */
  defaultEmail?: string;
  onUseDifferentAddress: () => void;
};

export const OUT_OF_AREA_TITLE_ID = "out-of-area-title";
const EMAIL_ID = "notify-email";
const COPY = JOB_BUILDER_COPY.notify;

/**
 * "Notify me" for an address outside the service area (T6 rule 16). It sits
 * inside the step form, so it is a group with its own RHF instance, not a
 * nested <form>; Enter in the email field sends it, never Continue.
 */
export function NotifyMeForm({ address, defaultEmail, onUseDifferentAddress }: NotifyMeFormProps) {
  const [status, setStatus] = React.useState<"idle" | "submitting" | "error" | "success">("idle");
  const [savedEmail, setSavedEmail] = React.useState("");
  const [serviceError, setServiceError] = React.useState("");
  const successRef = React.useRef<HTMLParagraphElement>(null);

  const form = useForm<Values, unknown, Output>({
    resolver: zodResolver(notifyMeSchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: { email: defaultEmail ?? "" },
  });
  const emailError = form.formState.errors.email?.message;
  const state = stateName(address.state);

  React.useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  async function onValid({ email }: Output) {
    setStatus("submitting");
    setServiceError("");
    try {
      await notify.capture(email, address);
      setSavedEmail(email);
      setStatus("success");
    } catch (caught) {
      setServiceError(isServiceError(caught) ? caught.message : SERVICE_MESSAGES.mockError);
      setStatus("error");
      form.setFocus("email");
    }
  }

  const submit = form.handleSubmit(onValid, () => form.setFocus("email"));
  const submitting = status === "submitting";

  return (
    <section
      aria-labelledby={OUT_OF_AREA_TITLE_ID}
      className="rounded-lg border border-input bg-surface p-4 md:p-6"
    >
      <div className="flex items-start gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft">
          <MapPinOff className="size-5 text-ink" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2
            id={OUT_OF_AREA_TITLE_ID}
            tabIndex={-1}
            className="text-h4 font-semibold text-ink outline-none focus-visible:outline-2"
          >
            {COPY.title(state)}
          </h2>
          <p className="mt-1 text-body-sm text-ink-muted">
            {COPY.body(servedStatesText(), address.city)}
          </p>
        </div>
      </div>

      {status === "success" ? (
        <p
          ref={successRef}
          id="notify-success"
          tabIndex={-1}
          role="status"
          className="mt-6 flex items-start gap-2 text-body-sm font-semibold text-ink outline-none focus-visible:outline-2"
        >
          <CircleCheck className="size-5 shrink-0 text-success" aria-hidden />
          <span>{COPY.success(savedEmail, state)}</span>
        </p>
      ) : (
        <FormField
          id={EMAIL_ID}
          label={COPY.email}
          error={emailError}
          describedByExtra={status === "error" && serviceError ? "notify-error" : undefined}
          className="mt-6"
          after={
            status === "error" &&
            serviceError && (
              <div role="alert">
                <FieldError id="notify-error" message={serviceError} />
              </div>
            )
          }
        >
          {(control) => (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <Input
                id={control.id}
                type="email"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                readOnly={submitting}
                aria-describedby={control.describedBy}
                aria-invalid={control.invalid || undefined}
                className="min-w-0 flex-1"
                {...form.register("email")}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void submit();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                loading={submitting}
                onClick={() => void submit()}
                className="w-full sm:w-auto"
              >
                {submitting ? COPY.submitting : COPY.submit}
              </Button>
            </div>
          )}
        </FormField>
      )}

      <Button
        type="button"
        variant="link"
        size="sm"
        className="mt-2"
        onClick={onUseDifferentAddress}
      >
        {COPY.changeAddress}
      </Button>
    </section>
  );
}

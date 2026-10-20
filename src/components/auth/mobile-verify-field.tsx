"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { CircleCheck } from "lucide-react";

import { emptyOtp, OtpInput, type OtpInputHandle } from "@/components/auth/otp-input";
import { FieldError, FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth, isServiceError } from "@/lib/mock/services";
import {
  AUTH_COPY,
  DEMO_OTP_CODE,
  OTP_RESEND_SECONDS,
  SERVICE_MESSAGES,
  VALIDATION_MESSAGES,
} from "@/lib/constants";
import { mobileSchema, otpCodeSchema } from "@/lib/validation";

type Phase = "idle" | "sending" | "code" | "verifying" | "verified";

/** A focus target RHF can call when this is the first invalid field. */
export type FocusTarget = { focus: () => void };

type MobileVerifyFieldProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** Called with true once the code is verified, false after "Change number". */
  onVerifiedChange: (verified: boolean) => void;
  /** Form-level error (format, or "Verify your mobile number"). */
  error?: string;
  /** Registers the field's focus target with the form (RHF `field.ref`). */
  focusRef?: (target: FocusTarget | null) => void;
  /** Field to focus once the number is verified (the next field). */
  nextFocusId?: string;
  disabled?: boolean;
};

/** "+15551234567" or "5551234567" → "(555) 123-4567". */
function formatUsMobile(value: string): string {
  const parsed = mobileSchema.safeParse(value);
  if (!parsed.success) return value;
  const digits = parsed.data.slice(-10);
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function serviceMessage(error: unknown): string {
  return isServiceError(error) ? error.message : SERVICE_MESSAGES.mockError;
}

/**
 * Mobile number with inline SMS verification (T5 decisions 1 and 13): Send
 * code → six-box code entry → Verify → "Mobile number verified". Resend has
 * a 30 s cooldown; Change number starts over. Every button is type="button",
 * and Enter runs the sub-action, so the outer form is never submitted from
 * here.
 */
export function MobileVerifyField({
  id = "mobile",
  value,
  onChange,
  onBlur,
  onVerifiedChange,
  error,
  focusRef,
  nextFocusId,
  disabled = false,
}: MobileVerifyFieldProps) {
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [code, setCode] = React.useState<string[]>(emptyOtp);
  const [rowError, setRowError] = React.useState<string | null>(null);
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const [sentMessage, setSentMessage] = React.useState<"sent" | "resent">("sent");
  const [resending, setResending] = React.useState(false);
  const [resendAt, setResendAt] = React.useState<number | null>(null);
  const [now, setNow] = React.useState(0);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const otpRef = React.useRef<OtpInputHandle>(null);

  const otpLabelId = `${id}-otp-label`;
  const otpHintId = `${id}-otp-hint`;
  const otpErrorId = `${id}-otp-error`;
  const statusId = `${id}-status`;
  const panelOpen = phase === "code" || phase === "verifying";

  // Resend countdown: ticks once a second until the cooldown ends.
  React.useEffect(() => {
    if (resendAt === null) return;
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= resendAt) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendAt]);

  const secondsLeft = resendAt === null ? 0 : Math.max(0, Math.ceil((resendAt - now) / 1000));

  const registerInput = React.useCallback(
    (element: HTMLInputElement | null) => {
      inputRef.current = element;
      focusRef?.(
        element
          ? {
              // With the code panel open, the first box is the field to fix.
              focus: () => {
                const firstBox = document.querySelector<HTMLInputElement>(
                  `[aria-labelledby="${otpLabelId}"] input`,
                );
                (firstBox ?? element).focus();
              },
            }
          : null,
      );
    },
    [focusRef, otpLabelId],
  );

  function startCooldown() {
    const current = Date.now();
    setNow(current);
    setResendAt(current + OTP_RESEND_SECONDS * 1000);
  }

  async function sendCode() {
    if (phase !== "idle") return;
    const parsed = mobileSchema.safeParse(value);
    if (!parsed.success) {
      setRowError(VALIDATION_MESSAGES.mobile);
      inputRef.current?.focus();
      return;
    }
    setRowError(null);
    setPhase("sending");
    try {
      await auth.sendOtp(value);
      setCode(emptyOtp());
      setOtpError(null);
      setSentMessage("sent");
      startCooldown();
      setPhase("code");
    } catch (caught) {
      flushSync(() => {
        setPhase("idle");
        setRowError(serviceMessage(caught));
      });
      inputRef.current?.focus();
    }
  }

  async function resendCode() {
    if (secondsLeft > 0 || resending) return;
    setResending(true);
    setOtpError(null);
    try {
      await auth.sendOtp(value);
      flushSync(() => {
        setCode(emptyOtp());
        setSentMessage("resent");
        setResending(false);
      });
      startCooldown();
      otpRef.current?.focus(0);
    } catch (caught) {
      setResending(false);
      setOtpError(serviceMessage(caught));
    }
  }

  async function verifyCode() {
    if (phase !== "code") return;
    const joined = code.join("");
    if (!otpCodeSchema.safeParse(joined).success) {
      setOtpError(VALIDATION_MESSAGES.otp);
      otpRef.current?.focus(
        Math.max(
          0,
          code.findIndex((digit) => digit === ""),
        ),
      );
      return;
    }
    setOtpError(null);
    setPhase("verifying");
    try {
      const ok = await auth.verifyOtp(value, joined);
      if (!ok) {
        // Errors never clear input: the digits stay, box 1 is selected.
        flushSync(() => {
          setPhase("code");
          setOtpError(VALIDATION_MESSAGES.otpWrong);
        });
        otpRef.current?.focus(0);
        return;
      }
      flushSync(() => {
        setPhase("verified");
        setResendAt(null);
      });
      onVerifiedChange(true);
      if (nextFocusId) document.getElementById(nextFocusId)?.focus();
    } catch (caught) {
      flushSync(() => {
        setPhase("code");
        setOtpError(serviceMessage(caught));
      });
      otpRef.current?.focus(0);
    }
  }

  function changeNumber() {
    flushSync(() => {
      setPhase("idle");
      setCode(emptyOtp());
      setOtpError(null);
      setRowError(null);
      setResendAt(null);
    });
    onVerifiedChange(false);
    inputRef.current?.focus();
  }

  const shownError = rowError ?? error;
  const readOnly = phase !== "idle";

  return (
    <FormField
      id={id}
      label={AUTH_COPY.fields.mobile}
      hint={AUTH_COPY.fields.mobileHint}
      error={shownError ?? undefined}
      describedByExtra={phase === "verified" ? statusId : undefined}
      after={
        <>
          {panelOpen && (
            <div className="mt-1 flex flex-col gap-4 rounded-md border border-border bg-surface p-4">
              <p role="status" className="text-body-sm text-ink">
                {sentMessage === "resent"
                  ? AUTH_COPY.otp.resent
                  : AUTH_COPY.otp.sentTo(formatUsMobile(value))}
              </p>
              <div>
                <p id={otpLabelId} className="text-body-sm font-semibold text-ink">
                  {AUTH_COPY.otp.codeLabel}
                </p>
                <div className="mt-2">
                  <OtpInput
                    ref={otpRef}
                    value={code}
                    onChange={(next) => {
                      setCode(next);
                      if (otpError) setOtpError(null);
                    }}
                    onEnter={() => void verifyCode()}
                    invalid={!!otpError}
                    disabled={disabled || phase === "verifying"}
                    labelId={otpLabelId}
                    describedBy={otpError ? `${otpHintId} ${otpErrorId}` : otpHintId}
                    autoFocus
                  />
                </div>
                <p id={otpHintId} className="mt-2 text-caption text-ink-muted">
                  {AUTH_COPY.otp.demoHint(DEMO_OTP_CODE)}
                </p>
                {otpError && (
                  <div role="alert" className="mt-2">
                    <FieldError id={otpErrorId} message={otpError} />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  loading={phase === "verifying"}
                  disabled={disabled}
                  onClick={() => void verifyCode()}
                >
                  {phase === "verifying" ? AUTH_COPY.otp.verifying : AUTH_COPY.otp.verify}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  loading={resending}
                  disabled={disabled || phase === "verifying" || secondsLeft > 0}
                  onClick={() => void resendCode()}
                >
                  <span aria-live="off">
                    {resending
                      ? AUTH_COPY.otp.sending
                      : secondsLeft > 0
                        ? AUTH_COPY.otp.resendIn(secondsLeft)
                        : AUTH_COPY.otp.resend}
                  </span>
                </Button>
              </div>
            </div>
          )}
          {phase === "verified" && (
            <p
              id={statusId}
              role="status"
              className="flex items-center gap-2 text-body-sm font-semibold text-ink"
            >
              <CircleCheck className="size-5 text-success" aria-hidden />
              {AUTH_COPY.otp.verified}
            </p>
          )}
        </>
      }
    >
      {({ describedBy, invalid }) => (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex min-w-0 flex-1">
            <span
              aria-hidden
              className="inline-flex h-12 items-center rounded-l-md border border-r-0 border-input bg-surface-alt px-3 text-body text-ink"
            >
              {AUTH_COPY.fields.mobilePrefix}
            </span>
            <Input
              ref={registerInput}
              id={id}
              name={id}
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder={AUTH_COPY.fields.mobilePlaceholder}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
              aria-required="true"
              readOnly={readOnly}
              disabled={disabled}
              value={value}
              onChange={(event) => {
                onChange(event.target.value);
                if (rowError) setRowError(null);
              }}
              onBlur={onBlur}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  if (phase === "idle") void sendCode();
                }
              }}
              className="rounded-l-none"
            />
          </div>
          {phase === "idle" || phase === "sending" ? (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              loading={phase === "sending"}
              disabled={disabled}
              onClick={() => void sendCode()}
            >
              {phase === "sending" ? AUTH_COPY.otp.sending : AUTH_COPY.otp.sendCode}
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              disabled={disabled || phase === "verifying"}
              onClick={changeNumber}
            >
              {AUTH_COPY.otp.changeNumber}
            </Button>
          )}
        </div>
      )}
    </FormField>
  );
}

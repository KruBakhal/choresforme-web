"use client";

import * as React from "react";

import { AUTH_COPY } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const OTP_LENGTH = 6;

export type OtpInputHandle = {
  /** Focuses a box (0-based) and selects its content. */
  focus: (index?: number) => void;
};

type OtpInputProps = {
  /** One entry per box; "" for an empty box. */
  value: readonly string[];
  onChange: (value: string[]) => void;
  /** Enter in any box (runs Verify; never submits the outer form). */
  onEnter?: () => void;
  invalid?: boolean;
  disabled?: boolean;
  /** Id of the visible label for the group. */
  labelId: string;
  /** Ids for the group's `aria-describedby` (hint, error). */
  describedBy?: string;
  /** Focus the first box when the input mounts. */
  autoFocus?: boolean;
  ref?: React.Ref<OtpInputHandle>;
};

/** Normalises any value to exactly OTP_LENGTH entries. */
export function emptyOtp(): string[] {
  return Array.from({ length: OTP_LENGTH }, () => "");
}

/**
 * Hand-built one-time code input (T5 decision 1): six single-digit boxes.
 * Typing a digit fills the box and moves on; paste (or SMS autofill) fills
 * from the first box; Backspace on an empty box moves back; arrows, Home and
 * End move between boxes; non-digits are ignored.
 */
export function OtpInput({
  value,
  onChange,
  onEnter,
  invalid = false,
  disabled = false,
  labelId,
  describedBy,
  autoFocus = false,
  ref,
}: OtpInputProps) {
  const inputs = React.useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? "");

  const focusBox = React.useCallback((index: number) => {
    const target = inputs.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))];
    target?.focus();
    target?.select();
  }, []);

  React.useImperativeHandle(ref, () => ({ focus: (index = 0) => focusBox(index) }), [focusBox]);

  React.useEffect(() => {
    if (autoFocus) focusBox(0);
  }, [autoFocus, focusBox]);

  function setBox(index: number, digit: string) {
    const next = [...digits];
    next[index] = digit;
    onChange(next);
  }

  /** Fills from box 1 with the digits in `text`, then focuses the box after the last one. */
  function fillFromStart(text: string) {
    const pasted = text.replace(/\D/g, "").slice(0, OTP_LENGTH).split("");
    if (pasted.length === 0) return;
    const next = emptyOtp();
    pasted.forEach((digit, i) => {
      next[i] = digit;
    });
    onChange(next);
    focusBox(Math.min(pasted.length, OTP_LENGTH - 1));
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    const { key } = event;
    if (key === "Enter") {
      event.preventDefault();
      onEnter?.();
      return;
    }
    if (key === "Backspace") {
      event.preventDefault();
      if (digits[index]) {
        setBox(index, "");
      } else if (index > 0) {
        setBox(index - 1, "");
        focusBox(index - 1);
      }
      return;
    }
    if (key === "Delete") {
      event.preventDefault();
      setBox(index, "");
      return;
    }
    if (key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
      return;
    }
    if (key === "ArrowRight") {
      event.preventDefault();
      focusBox(index + 1);
      return;
    }
    if (key === "Home") {
      event.preventDefault();
      focusBox(0);
      return;
    }
    if (key === "End") {
      event.preventDefault();
      focusBox(OTP_LENGTH - 1);
      return;
    }
    if (/^\d$/.test(key) && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      setBox(index, key);
      if (index < OTP_LENGTH - 1) focusBox(index + 1);
    }
  }

  /** Mobile keyboards and SMS autofill that skip `keydown` arrive here. */
  function handleChange(index: number, event: React.ChangeEvent<HTMLInputElement>) {
    const typed = event.target.value.replace(/\D/g, "");
    if (typed.length > 1) {
      fillFromStart(typed);
      return;
    }
    if (typed.length === 1) {
      setBox(index, typed);
      if (index < OTP_LENGTH - 1) focusBox(index + 1);
      return;
    }
    if (event.target.value === "") setBox(index, "");
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    fillFromStart(event.clipboardData.getData("text"));
  }

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      aria-describedby={describedBy}
      className="flex gap-2"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={index === 0 ? OTP_LENGTH : 1}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={AUTH_COPY.otp.digitLabel(index + 1)}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          value={digit}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onChange={(event) => handleChange(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          className={cn(
            "h-12 w-11 min-w-0 rounded-md border border-input bg-surface text-center text-h4 font-semibold text-ink caret-ink disabled:opacity-50 aria-invalid:border-danger sm:w-12",
          )}
        />
      ))}
    </div>
  );
}

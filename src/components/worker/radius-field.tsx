"use client";

import * as React from "react";

import { FieldError } from "@/components/forms/form-field";
import { Slider } from "@/components/ui/slider";
import { LIMITS, WORKER_ONBOARDING_COPY } from "@/lib/constants";

type RadiusFieldProps = {
  id: string;
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  /** The thumb (`role="slider"`), so the form can focus it. */
  ref?: React.Ref<HTMLSpanElement>;
};

const COPY = WORKER_ONBOARDING_COPY.area;
/** Arrow keys (T9 open question 9). */
const STEP = 5;
/** Page Up / Page Down and Shift + arrows (Radix's own big step would be ±50). */
const BIG_STEP = 25;

const clamp = (value: number) => Math.min(Math.max(value, LIMITS.radiusMin), LIMITS.radiusMax);

/**
 * Service radius (T9): a labelled 5–200 mile slider with the value as text.
 * The thumb is one Tab stop; arrows ±5, Page Up / Page Down ±25, Home / End
 * 5 / 200. Screen readers hear "N miles" (`aria-valuetext`).
 */
export function RadiusField({
  id,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  ref,
}: RadiusFieldProps) {
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const valueText = COPY.radiusValue(value);

  function onKeyDown(event: React.KeyboardEvent<HTMLSpanElement>) {
    const up =
      event.key === "PageUp" || (event.shiftKey && ["ArrowUp", "ArrowRight"].includes(event.key));
    const down =
      event.key === "PageDown" ||
      (event.shiftKey && ["ArrowDown", "ArrowLeft"].includes(event.key));
    if (!up && !down) return;
    // Handled here: Radix skips its own handler once the default is prevented.
    event.preventDefault();
    onChange(clamp(value + (up ? BIG_STEP : -BIG_STEP)));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <span id={labelId} className="text-body-sm font-semibold text-ink">
          {COPY.radiusLabel}
        </span>
        <p aria-hidden className="text-h4 font-semibold text-ink tabular-nums">
          {valueText}
        </p>
      </div>
      <Slider
        min={LIMITS.radiusMin}
        max={LIMITS.radiusMax}
        step={STEP}
        disabled={disabled}
        value={[value]}
        onValueChange={(next) => onChange(clamp(next[0] ?? value))}
        onKeyDown={onKeyDown}
        thumbProps={{
          ref,
          id,
          "aria-labelledby": labelId,
          "aria-valuetext": valueText,
          "aria-describedby": error ? `${hintId} ${errorId}` : hintId,
          "aria-invalid": error ? true : undefined,
          onBlur,
        }}
      />
      <div aria-hidden className="flex justify-between text-caption text-ink-muted">
        <span>{COPY.scaleMin}</span>
        <span>{COPY.scaleMax}</span>
      </div>
      <p id={hintId} className="text-body-sm text-ink-muted">
        {COPY.radiusHint}
      </p>
      {error && <FieldError id={errorId} message={error} />}
    </div>
  );
}

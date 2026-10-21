"use client";

import * as React from "react";
import { Star } from "lucide-react";

import { FieldError } from "@/components/forms/form-field";
import { DASHBOARD_COPY, LIMITS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type StarRatingFieldProps = {
  name: string;
  legend: string;
  value: number | undefined;
  onChange: (value: number) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  /** RHF `field.ref`: the checked radio (or the first) takes focus on an error. */
  focusRef?: React.Ref<HTMLInputElement>;
  idPrefix?: string;
};

const COPY = DASHBOARD_COPY.rate;
const STARS = Array.from(
  { length: LIMITS.ratingMax - LIMITS.ratingMin + 1 },
  (_, i) => LIMITS.ratingMin + i,
);

/**
 * 1–5 stars, hand-built from five native radios in a `fieldset` (T8
 * decision 4, no library): one Tab stop, arrow keys move and check, Space
 * checks. A chosen star is filled as well as coloured, and the read-out
 * states the value in text, so colour is never the only signal.
 */
export function StarRatingField({
  name,
  legend,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  focusRef,
  idPrefix = "stars",
}: StarRatingFieldProps) {
  const readoutId = `${idPrefix}-readout`;
  const errorId = `${idPrefix}-error`;
  const focusIndex = value ?? LIMITS.ratingMin;

  return (
    <fieldset
      className="min-w-0"
      aria-describedby={error ? `${readoutId} ${errorId}` : readoutId}
      disabled={disabled}
    >
      <legend className="text-body-sm font-semibold text-ink">{legend}</legend>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex gap-1">
          {STARS.map((star) => {
            const filled = value !== undefined && star <= value;
            return (
              <label key={star} className="relative cursor-pointer">
                <input
                  ref={star === focusIndex ? focusRef : undefined}
                  id={`${idPrefix}-${star}`}
                  type="radio"
                  name={name}
                  value={star}
                  checked={value === star}
                  onChange={() => onChange(star)}
                  onBlur={onBlur}
                  className="peer sr-only"
                />
                <span className="flex size-11 items-center justify-center rounded-md transition-colors duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring hover:bg-surface-alt motion-reduce:transition-none">
                  <Star
                    className={cn(
                      "size-6",
                      filled ? "fill-warning text-warning" : "text-ink-muted",
                    )}
                    aria-hidden
                  />
                  <span className="sr-only">{COPY.star(star)}</span>
                </span>
              </label>
            );
          })}
        </div>
        <p id={readoutId} className="text-body-sm font-semibold text-ink">
          {value !== undefined ? (
            COPY.readout(value)
          ) : (
            <span className="font-normal text-ink-muted">{COPY.readoutEmpty}</span>
          )}
        </p>
      </div>
      {error && (
        <div className="mt-2">
          <FieldError id={errorId} message={error} />
        </div>
      )}
    </fieldset>
  );
}

"use client";

import * as React from "react";
import { Info } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { CARD_BRAND_LABELS, JOB_BUILDER_COPY } from "@/lib/constants";
import { detectCardBrand } from "@/lib/validation";

type CardFieldName = "number" | "expiry" | "cvc";

type CardFieldsProps = {
  /** `register("card.number")` and so on, from the caller's form. */
  fields: Record<CardFieldName, UseFormRegisterReturn>;
  errors: Partial<Record<CardFieldName, string>>;
  /** The typed number (for the live brand label). */
  numberValue: string;
  /** Id of the panel (the "Add a new card" option's `aria-controls`). */
  panelId?: string;
  /** "We couldn't add this card" (`FormAlert`), at the top of the panel. */
  alert?: React.ReactNode;
};

const COPY = JOB_BUILDER_COPY.payment;
const DEMO_NOTE_ID = "card-demo-note";
const BRAND_ID = "card-number-brand";

/** "4242 4242 4242 4242"; Amex "3782 822463 10005". */
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (detectCardBrand(digits) === "amex") {
    const d = digits.slice(0, 15);
    return [d.slice(0, 4), d.slice(4, 10), d.slice(10)].filter(Boolean).join(" ");
  }
  return (digits.slice(0, 16).match(/.{1,4}/g) ?? []).join(" ");
}

/** "12" → "12/" while typing; deleting keeps what is left. */
function formatExpiry(value: string, inserting: boolean): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  if (digits.length === 2 && inserting) return `${digits}/`;
  return digits;
}

/** Reformats the input's value and keeps the caret after the same digit. */
function reformat(input: HTMLInputElement, next: string) {
  if (input.value === next) return;
  const caret = input.selectionStart ?? input.value.length;
  const atEnd = caret >= input.value.length;
  const digitsBefore = input.value.slice(0, caret).replace(/\D/g, "").length;
  input.value = next;
  if (atEnd) return;
  let position = 0;
  let seen = 0;
  while (position < next.length && seen < digitsBefore) {
    if (/\d/.test(next[position])) seen += 1;
    position += 1;
  }
  input.setSelectionRange(position, position);
}

function isInsert(event: React.ChangeEvent<HTMLInputElement>): boolean {
  const inputType = (event.nativeEvent as InputEvent).inputType ?? "";
  return !inputType.startsWith("delete");
}

/**
 * Card number (with the live brand label), expiry and security code (T7;
 * T8 Account may reuse). Values live in the caller's form state only: never
 * in a store, the URL or a log. Nothing leaves the browser.
 */
export function CardFields({ fields, errors, numberValue, panelId, alert }: CardFieldsProps) {
  const brand = detectCardBrand(numberValue.replace(/\D/g, ""));

  return (
    <div id={panelId} className="rounded-lg border border-border bg-surface p-4 md:p-6">
      <div className="flex w-full max-w-xl flex-col gap-6">
        {alert}
        <p
          id={DEMO_NOTE_ID}
          className="flex items-start gap-2 rounded-md bg-brand-soft p-3 text-body-sm text-ink"
        >
          <Info className="mt-1 size-4 shrink-0" aria-hidden />
          {COPY.demoNote}
        </p>
        <FormField
          id="card-number"
          label={COPY.numberLabel}
          error={errors.number}
          describedByExtra={brand ? `${DEMO_NOTE_ID} ${BRAND_ID}` : DEMO_NOTE_ID}
        >
          {({ id, describedBy, invalid }) => (
            <div className="relative">
              <Input
                id={id}
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                autoCorrect="off"
                spellCheck={false}
                maxLength={19}
                aria-required="true"
                aria-describedby={describedBy}
                aria-invalid={invalid || undefined}
                className="pr-24"
                {...fields.number}
                onChange={(event) => {
                  reformat(event.target, formatCardNumber(event.target.value));
                  void fields.number.onChange(event);
                }}
              />
              {brand && (
                <span
                  id={BRAND_ID}
                  className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-body-sm font-semibold text-ink"
                >
                  {CARD_BRAND_LABELS[brand]}
                </span>
              )}
            </div>
          )}
        </FormField>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          <FormField
            id="card-expiry"
            label={COPY.expiryLabel}
            hint={COPY.expiryHint}
            error={errors.expiry}
          >
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder={COPY.expiryHint}
                maxLength={5}
                aria-required="true"
                aria-describedby={describedBy}
                aria-invalid={invalid || undefined}
                {...fields.expiry}
                onChange={(event) => {
                  reformat(event.target, formatExpiry(event.target.value, isInsert(event)));
                  void fields.expiry.onChange(event);
                }}
              />
            )}
          </FormField>
          <FormField id="card-cvc" label={COPY.cvcLabel} hint={COPY.cvcHint} error={errors.cvc}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                inputMode="numeric"
                autoComplete="cc-csc"
                maxLength={4}
                aria-required="true"
                aria-describedby={describedBy}
                aria-invalid={invalid || undefined}
                {...fields.cvc}
              />
            )}
          </FormField>
        </div>
      </div>
    </div>
  );
}

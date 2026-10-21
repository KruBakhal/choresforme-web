"use client";

import * as React from "react";
import { CreditCard, Plus } from "lucide-react";

import { SelectableCard } from "@/components/flow/selectable-card";
import { RadioGroup } from "@/components/ui/radio-group";
import { CARD_BRAND_LABELS, JOB_BUILDER_COPY } from "@/lib/constants";
import type { PaymentMethod } from "@/lib/types";

/** The "Add a new card" option's value. */
export const NEW_CARD_VALUE = "new";

type PaymentMethodPickerProps = {
  methods: PaymentMethod[];
  /** A method id or `NEW_CARD_VALUE`. */
  value: string;
  onValueChange: (value: string) => void;
  onBlur?: () => void;
  cardPanelId: string;
  /** The card form, rendered right after "Add a new card" (or alone with no saved card). */
  children?: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
};

const COPY = JOB_BUILDER_COPY.payment;
const TITLE_ID = "payment-methods-title";

/**
 * Saved cards ("Visa ending 4242") plus "Add a new card" as one radio group
 * (T7; T8 Account may reuse). Only the brand and last 4 digits are ever shown.
 */
export function PaymentMethodPicker({
  methods,
  value,
  onValueChange,
  onBlur,
  cardPanelId,
  children,
  ref,
}: PaymentMethodPickerProps) {
  if (methods.length === 0) {
    return (
      <section aria-labelledby={TITLE_ID} className="flex flex-col gap-4">
        <div>
          <h2 id={TITLE_ID} className="text-h4 font-semibold text-ink">
            {COPY.noSavedTitle}
          </h2>
          <p className="mt-1 text-body-sm text-ink-muted">{COPY.noSavedIntro}</p>
        </div>
        {children}
      </section>
    );
  }

  return (
    <section aria-labelledby={TITLE_ID} className="flex flex-col gap-4">
      <h2 id={TITLE_ID} className="text-h4 font-semibold text-ink">
        {COPY.methodsTitle}
      </h2>
      <RadioGroup
        name="payment-method"
        value={value}
        onValueChange={onValueChange}
        aria-labelledby={TITLE_ID}
        className="grid grid-cols-1 gap-3"
      >
        {methods.map((method) => (
          <SelectableCard
            key={method.id}
            ref={value === method.id ? ref : undefined}
            type="radio"
            layout="row"
            icon={CreditCard}
            value={method.id}
            title={COPY.savedCard(CARD_BRAND_LABELS[method.brand], method.last4)}
            onBlur={onBlur}
          />
        ))}
        <SelectableCard
          ref={value === NEW_CARD_VALUE ? ref : undefined}
          type="radio"
          layout="row"
          icon={Plus}
          value={NEW_CARD_VALUE}
          title={COPY.addNew}
          description={COPY.addNewDescription}
          controls={cardPanelId}
          onBlur={onBlur}
        />
      </RadioGroup>
      {value === NEW_CARD_VALUE && children}
    </section>
  );
}

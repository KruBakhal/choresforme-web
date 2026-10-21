"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { CreditCard, Plus } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";

import { CardFields } from "@/components/forms/card-fields";
import { focusFirstError } from "@/components/forms/focus-first-error";
import { FormAlert, nextAlertKey } from "@/components/forms/form-alert";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { CARD_BRAND_LABELS, DASHBOARD_COPY, SCREEN_STATE_COPY } from "@/lib/constants";
import { payments } from "@/lib/mock/services";
import type { PaymentMethod } from "@/lib/types";
import { cardSchema, zodResolver } from "@/lib/validation";

export type MethodsState =
  | { status: "loading" }
  | { status: "error"; retrying: boolean }
  | { status: "ready"; methods: PaymentMethod[] };

type Values = z.input<typeof cardSchema>;
type Output = z.output<typeof cardSchema>;

type PaymentMethodsSectionProps = {
  userId: string;
  state: MethodsState;
  onRetry: () => void;
  onAdded: (method: PaymentMethod) => void;
};

const COPY = DASHBOARD_COPY.account;
const FORM_ID = "add-card-form";
const ADD_BUTTON_ID = "add-card";
const FIELD_ORDER = ["number", "expiry", "cvc"] as const;
/* Section-level states sit inside the section card: no card inside a card. */
const inCard = "border-0 px-0 py-8 md:px-0 md:py-8";

const cardLabel = (method: PaymentMethod) =>
  COPY.cardLabel(CARD_BRAND_LABELS[method.brand], method.last4);

/**
 * Account → Payment details (T8 decision 7): saved cards (brand and last 4
 * only) and "Add a card". Card values live in this form's state only: never
 * a store, the URL, a log or analytics.
 */
export function PaymentMethodsSection({
  userId,
  state,
  onRetry,
  onAdded,
}: PaymentMethodsSectionProps) {
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [failedKey, setFailedKey] = React.useState(0);
  const [added, setAdded] = React.useState<{ key: number; label: string } | null>(null);

  const form = useForm<Values, unknown, Output>({
    resolver: zodResolver(cardSchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: { number: "", expiry: "", cvc: "" },
  });
  const numberValue = useWatch({ control: form.control, name: "number" }) ?? "";
  const { errors } = form.formState;

  function openPanel() {
    flushSync(() => {
      setAdded(null);
      setFailedKey(0);
      setPanelOpen(true);
    });
    form.setFocus("number");
  }

  function closePanel() {
    flushSync(() => setPanelOpen(false));
    form.reset();
    setFailedKey(0);
    document.getElementById(ADD_BUTTON_ID)?.focus();
  }

  async function onValid(output: Output) {
    if (adding) return;
    setAdding(true);
    setFailedKey(0);
    try {
      const method = await payments.addMethod(userId, output);
      onAdded(method);
      form.reset();
      setPanelOpen(false);
      setAdded({ key: nextAlertKey(), label: cardLabel(method) });
    } catch {
      // Errors never clear typed input.
      setFailedKey(nextAlertKey());
    } finally {
      setAdding(false);
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    void form.handleSubmit(onValid, focusFirstError(FIELD_ORDER, form.setFocus))(event);
  }

  return (
    <section
      id="payment"
      aria-labelledby="payment-title"
      className="rounded-lg border border-border bg-surface p-4 md:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="payment-title" className="text-h4 font-semibold text-ink">
          {COPY.paymentTitle}
        </h2>
        {state.status === "ready" && !panelOpen && (
          <Button
            id={ADD_BUTTON_ID}
            type="button"
            variant="outline"
            size="sm"
            aria-expanded={false}
            onClick={openPanel}
          >
            <Plus aria-hidden />
            {COPY.addCard}
          </Button>
        )}
      </div>

      {state.status === "loading" && (
        <LoadingState variant="rows" count={2} label={COPY.paymentsLoading} className="mt-4" />
      )}
      {state.status === "error" && (
        <ErrorState
          headingLevel={3}
          className={inCard}
          isRetrying={state.retrying}
          onRetry={onRetry}
        />
      )}
      {state.status === "ready" && (
        <>
          {added && (
            <FormAlert
              key={added.key}
              tone="success"
              message={COPY.cardAdded(added.label)}
              className="mt-4"
            />
          )}
          {state.methods.length > 0 ? (
            <ul className="mt-4 divide-y divide-border rounded-md border border-border">
              {state.methods.map((method) => (
                <li key={method.id} className="flex min-h-14 items-center gap-4 px-4 py-3">
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-alt"
                  >
                    <CreditCard className="size-5 text-ink" />
                  </span>
                  <p className="text-body font-semibold text-ink">{cardLabel(method)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-body-sm text-ink-muted">{COPY.noCards}</p>
          )}
          {panelOpen && (
            <form id={FORM_ID} noValidate onSubmit={onSubmit} className="mt-6 flex flex-col gap-6">
              <CardFields
                panelId="add-card-panel"
                numberValue={numberValue}
                fields={{
                  number: form.register("number"),
                  expiry: form.register("expiry"),
                  cvc: form.register("cvc"),
                }}
                errors={{
                  number: errors.number?.message,
                  expiry: errors.expiry?.message,
                  cvc: errors.cvc?.message,
                }}
                alert={
                  failedKey > 0 && (
                    <FormAlert key={failedKey} tone="error" message={SCREEN_STATE_COPY.cardError} />
                  )
                }
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" disabled={adding} onClick={closePanel}>
                  {COPY.cancel}
                </Button>
                <Button type="submit" loading={adding}>
                  {adding ? COPY.addingCard : COPY.saveCard}
                </Button>
              </div>
            </form>
          )}
        </>
      )}
    </section>
  );
}

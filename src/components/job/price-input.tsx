"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { Controller, useWatch, type FieldValues, type UseFormReturn } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JOB_BUILDER_COPY, LIMITS, PRICING_TYPE_LABELS } from "@/lib/constants";
import { estimatedTotal, formatUsd, parseAmount } from "@/lib/job-builder";
import type { PricingType } from "@/lib/types";
import { cn } from "@/lib/utils";

/** The price fields of the details form. `amount` is the fixed price or the hourly rate, as typed. */
export type PriceFormValues = {
  pricingType: PricingType;
  amount: string;
  hours: string;
};

/** A form that holds the price fields (other fields may exist alongside). */
export type PriceInputForm = UseFormReturn<PriceFormValues, unknown, FieldValues>;

type PriceInputProps = {
  form: PriceInputForm;
};

const COPY = JOB_BUILDER_COPY.details;
const PRICING_TYPES: readonly PricingType[] = ["fixed", "hourly"];
const ANNOUNCE_DELAY_MS = 500;

/** 1, 1.5 … 12 (23 values). */
const HOUR_OPTIONS = Array.from(
  { length: (LIMITS.hoursMax - LIMITS.hoursMin) / LIMITS.hoursStep + 1 },
  (_, i) => LIMITS.hoursMin + i * LIMITS.hoursStep,
);

function DollarField({
  id,
  describedBy,
  invalid,
  ...props
}: React.ComponentProps<"input"> & { describedBy?: string; invalid: boolean }) {
  return (
    <div className="flex">
      <span
        aria-hidden
        className="inline-flex h-12 items-center rounded-l-md border border-r-0 border-input bg-surface-alt px-3 text-body text-ink"
      >
        $
      </span>
      <Input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className="rounded-l-none"
        {...props}
      />
    </div>
  );
}

/**
 * Fixed Price or Hourly (T6 step 4): a segmented radio group, the amount in
 * USD, the hours (1–12 in half hours) and, for hourly, the live estimated
 * total (rate × hours). Switching type keeps both amounts while on the page
 * (decision 9).
 */
export function PriceInput({ form }: PriceInputProps) {
  const { errors } = form.formState;
  const [pricingType, amount, hours] = useWatch({
    control: form.control,
    name: ["pricingType", "amount", "hours"],
  });
  const stash = React.useRef<Record<PricingType, string>>({ fixed: "", hourly: "" });
  const [announcement, setAnnouncement] = React.useState("");

  const hourly = pricingType === "hourly";
  const rate = parseAmount(amount);
  const hoursValue = hours ? Number(hours) : undefined;
  const total = hourly ? estimatedTotal("hourly", rate, hoursValue) : null;

  React.useEffect(() => {
    if (!hourly || total === null) return;
    const timer = setTimeout(
      () => setAnnouncement(COPY.estimateLive(formatUsd(total))),
      ANNOUNCE_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [hourly, total]);

  function changeType(next: PricingType, current: PricingType) {
    if (next === current) return;
    stash.current[current] = form.getValues("amount");
    form.setValue("pricingType", next, { shouldDirty: true });
    form.setValue("amount", stash.current[next], { shouldDirty: true });
    form.clearErrors(["amount", "hours"]);
  }

  return (
    <fieldset className="flex min-w-0 flex-col gap-6">
      <legend className="text-body-sm font-semibold text-ink">{COPY.priceLegend}</legend>
      <Controller
        control={form.control}
        name="pricingType"
        render={({ field }) => (
          <RadioGroup
            aria-label={COPY.pricingTypeLabel}
            name={field.name}
            value={field.value}
            onValueChange={(value) => changeType(value as PricingType, field.value)}
            className="mt-4 grid w-full grid-cols-2 gap-1 rounded-md border border-input bg-surface p-1 sm:max-w-sm"
          >
            {PRICING_TYPES.map((type) => (
              <RadioGroupPrimitive.Item
                key={type}
                ref={type === field.value ? field.ref : undefined}
                value={type}
                onBlur={field.onBlur}
                className={cn(
                  "group/segment flex h-11 items-center justify-center gap-2 rounded-sm text-body font-semibold text-ink transition-colors duration-150 hover:bg-surface-alt focus-visible:outline-offset-0 motion-reduce:transition-none",
                  "data-[state=checked]:bg-brand data-[state=checked]:text-brand-foreground data-[state=checked]:hover:bg-brand",
                )}
              >
                <Check
                  className="hidden size-4 group-data-[state=checked]/segment:block"
                  aria-hidden
                />
                {PRICING_TYPE_LABELS[type]}
              </RadioGroupPrimitive.Item>
            ))}
          </RadioGroup>
        )}
      />

      {!hourly ? (
        <FormField
          id="amount"
          label={COPY.fixedLabel}
          hint={COPY.fixedHint}
          error={errors.amount?.message}
          className="sm:max-w-xs"
        >
          {(control) => (
            <DollarField
              id={control.id}
              describedBy={control.describedBy}
              invalid={control.invalid}
              {...form.register("amount")}
            />
          )}
        </FormField>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              id="amount"
              label={COPY.rateLabel}
              hint={COPY.rateHint}
              error={errors.amount?.message}
            >
              {(control) => (
                <DollarField
                  id={control.id}
                  describedBy={control.describedBy}
                  invalid={control.invalid}
                  {...form.register("amount")}
                />
              )}
            </FormField>
            <Controller
              control={form.control}
              name="hours"
              render={({ field }) => (
                <FormField
                  id="hours"
                  label={COPY.hoursLabel}
                  hint={COPY.hoursHint}
                  error={errors.hours?.message}
                  className="min-w-0"
                >
                  {(control) => (
                    <Select
                      name={field.name}
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        ref={field.ref}
                        id={control.id}
                        aria-describedby={control.describedBy}
                        aria-invalid={control.invalid || undefined}
                        onBlur={field.onBlur}
                      >
                        <SelectValue placeholder={COPY.hoursPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {HOUR_OPTIONS.map((value) => (
                          <SelectItem key={value} value={String(value)}>
                            {COPY.hoursOption(value)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </FormField>
              )}
            />
          </div>
          <div
            id="estimate"
            className="flex flex-col gap-1 rounded-md border border-border bg-surface-alt p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-body font-semibold text-ink">{COPY.estimateLabel}</p>
            <div className="sm:text-right">
              {total === null ? (
                <p className="text-body text-ink-muted">{COPY.estimateEmpty}</p>
              ) : (
                <>
                  <p className="text-h4 font-semibold text-ink">{formatUsd(total)}</p>
                  {rate !== undefined && hoursValue !== undefined && (
                    <p className="text-body-sm text-ink-muted">
                      {JOB_BUILDER_COPY.summary.hourlyBreakdown(formatUsd(rate), hoursValue)}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {hourly && total !== null ? announcement : ""}
      </span>
    </fieldset>
  );
}

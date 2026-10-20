"use client";

import * as React from "react";
import { Info, Loader2 } from "lucide-react";
import { Controller, type FieldValues, type UseFormReturn } from "react-hook-form";
import type { z } from "zod";

import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JOB_BUILDER_COPY, LIMITS, US_STATES } from "@/lib/constants";
import { addresses } from "@/lib/mock/services";
import type { Address } from "@/lib/types";
import type { addressSchema } from "@/lib/validation";

/** The form shape `AddressInput` works with: the address under `address`. */
export type AddressFieldValues = { address: z.input<typeof addressSchema> };

type AddressInputProps<TOutput extends FieldValues> = {
  form: UseFormReturn<AddressFieldValues, unknown, TOutput>;
  /** Prefix for element ids ("address" → "address-line1"). */
  idPrefix?: string;
  onSuggestionApplied?: (address: Address) => void;
};

const COPY = JOB_BUILDER_COPY.location;
const SUGGEST_DELAY_MS = 300;

const formatPlace = (address: Pick<Address, "city" | "state" | "zip">) =>
  `${address.city}, ${address.state} ${address.zip}`;

/**
 * US address fields (T6; reused by T9): street with mocked autocomplete
 * (`addresses.suggest`, ARIA 1.2 combobox), city, state (a select of the 50
 * states and DC, so a non-US address cannot be entered), ZIP and an optional
 * landmark. Choosing a suggestion fills street, city, state and ZIP. Manual
 * entry always works.
 */
export function AddressInput<TOutput extends FieldValues>({
  form,
  idPrefix = "address",
  onSuggestionApplied,
}: AddressInputProps<TOutput>) {
  const ids = {
    line1: `${idPrefix}-line1`,
    city: `${idPrefix}-city`,
    state: `${idPrefix}-state`,
    zip: `${idPrefix}-zip`,
    landmark: `${idPrefix}-landmark`,
    listbox: `${idPrefix}-suggestions`,
    status: `${idPrefix}-suggest-status`,
    note: `${idPrefix}-suggest-note`,
    option: (index: number) => `${idPrefix}-option-${index}`,
  };
  const errors = form.formState.errors.address;

  const [suggestions, setSuggestions] = React.useState<Address[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [unavailable, setUnavailable] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = React.useRef(0);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function stopSearch() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    requestId.current += 1;
    setLoading(false);
  }

  function search(query: string) {
    stopSearch();
    setActiveIndex(-1);
    if (query.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(() => {
      const id = requestId.current + 1;
      requestId.current = id;
      setLoading(true);
      setOpen(true);
      addresses
        .suggest(query)
        .then((results) => {
          if (id !== requestId.current) return;
          setSuggestions(results);
          setLoading(false);
          setUnavailable(false);
          setStatus(results.length > 0 ? COPY.found(results.length) : COPY.noMatches);
        })
        .catch(() => {
          if (id !== requestId.current) return;
          setSuggestions([]);
          setLoading(false);
          setUnavailable(true);
          setStatus("");
        });
    }, SUGGEST_DELAY_MS);
  }

  function apply(address: Address) {
    stopSearch();
    const options = { shouldDirty: true } as const;
    form.setValue("address.line1", address.line1, options);
    form.setValue("address.city", address.city, options);
    form.setValue(
      "address.state",
      address.state as AddressFieldValues["address"]["state"],
      options,
    );
    form.setValue("address.zip", address.zip, options);
    form.clearErrors(["address.line1", "address.city", "address.state", "address.zip"]);
    setSuggestions([]);
    setOpen(false);
    setActiveIndex(-1);
    setStatus(COPY.filled(`${address.line1}, ${formatPlace(address)}`));
    onSuggestionApplied?.(address);
  }

  const expanded = open && !loading && suggestions.length > 0;
  const showPopup = open && (loading || suggestions.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <Controller
        control={form.control}
        name="address.line1"
        render={({ field }) => (
          <FormField
            id={ids.line1}
            label={COPY.line1}
            error={errors?.line1?.message}
            describedByExtra={unavailable ? ids.note : undefined}
            after={
              unavailable && (
                <p id={ids.note} className="flex items-start gap-2 text-body-sm text-ink-muted">
                  <Info className="size-4 shrink-0" aria-hidden />
                  <span>{COPY.suggestError}</span>
                </p>
              )
            }
          >
            {(control) => (
              <div className="relative">
                <Input
                  ref={field.ref}
                  id={control.id}
                  name={field.name}
                  value={field.value ?? ""}
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={expanded}
                  aria-controls={ids.listbox}
                  aria-activedescendant={
                    expanded && activeIndex >= 0 ? ids.option(activeIndex) : undefined
                  }
                  aria-describedby={control.describedBy}
                  aria-invalid={control.invalid || undefined}
                  autoComplete="off"
                  maxLength={LIMITS.addressLine1Max}
                  onChange={(event) => {
                    field.onChange(event);
                    search(event.target.value);
                  }}
                  onBlur={() => {
                    setOpen(false);
                    field.onBlur();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                      if (suggestions.length === 0) return;
                      event.preventDefault();
                      setOpen(true);
                      const step = event.key === "ArrowDown" ? 1 : -1;
                      setActiveIndex((index) =>
                        index < 0 && step < 0
                          ? suggestions.length - 1
                          : (index + step + suggestions.length) % suggestions.length,
                      );
                    } else if (event.key === "Enter") {
                      if (expanded && activeIndex >= 0) {
                        event.preventDefault();
                        apply(suggestions[activeIndex]);
                      }
                    } else if (event.key === "Escape") {
                      if (open) {
                        event.preventDefault();
                        setOpen(false);
                        setActiveIndex(-1);
                      }
                    } else if (event.key === "Tab") {
                      setOpen(false);
                    }
                  }}
                />
                {showPopup && (
                  <div className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-md border border-input bg-surface">
                    {loading && (
                      <div className="flex min-h-11 items-center gap-2 px-4 text-body-sm text-ink-muted">
                        <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden />
                        {COPY.searching}
                      </div>
                    )}
                    {!loading && (
                      <ul id={ids.listbox} role="listbox" aria-label={COPY.suggestionsLabel}>
                        {suggestions.map((address, index) => (
                          <li
                            key={`${address.line1}|${address.zip}`}
                            id={ids.option(index)}
                            role="option"
                            aria-selected={index === activeIndex}
                            data-active={index === activeIndex}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => apply(address)}
                            className="flex min-h-14 cursor-pointer flex-col justify-center px-4 py-2 transition-colors duration-150 hover:bg-surface-alt data-[active=true]:bg-surface-alt motion-reduce:transition-none"
                          >
                            <span className="text-body font-semibold text-ink">
                              {address.line1}
                            </span>
                            <span className="text-body-sm text-ink-muted">
                              {formatPlace(address)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </FormField>
        )}
      />
      <span id={ids.status} className="sr-only" role="status">
        {status}
      </span>

      <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-6">
        <FormField
          id={ids.city}
          label={COPY.city}
          error={errors?.city?.message}
          className="col-span-2 md:col-span-3"
        >
          {(control) => (
            <Input
              id={control.id}
              aria-describedby={control.describedBy}
              aria-invalid={control.invalid || undefined}
              autoComplete="address-level2"
              {...form.register("address.city")}
            />
          )}
        </FormField>
        <Controller
          control={form.control}
          name="address.state"
          render={({ field }) => (
            <FormField
              id={ids.state}
              label={COPY.state}
              error={errors?.state?.message}
              className="col-span-1 min-w-0 md:col-span-2"
            >
              {(control) => (
                <Select name={field.name} value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger
                    ref={field.ref}
                    id={control.id}
                    aria-describedby={control.describedBy}
                    aria-invalid={control.invalid || undefined}
                    onBlur={field.onBlur}
                  >
                    <SelectValue placeholder={COPY.statePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state.code} value={state.code}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>
          )}
        />
        <FormField
          id={ids.zip}
          label={COPY.zip}
          error={errors?.zip?.message}
          className="col-span-1 min-w-0 md:col-span-1"
        >
          {(control) => (
            <Input
              id={control.id}
              aria-describedby={control.describedBy}
              aria-invalid={control.invalid || undefined}
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              {...form.register("address.zip")}
            />
          )}
        </FormField>
      </div>

      <FormField id={ids.landmark} label={COPY.landmark} hint={COPY.landmarkHint}>
        {(control) => (
          <Input
            id={control.id}
            aria-describedby={control.describedBy}
            autoComplete="off"
            {...form.register("address.landmark")}
          />
        )}
      </FormField>
    </div>
  );
}

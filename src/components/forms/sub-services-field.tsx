"use client";

import * as React from "react";
import {
  Controller,
  useFormState,
  useWatch,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";

import { SelectableCard } from "@/components/flow/selectable-card";
import { FieldError, FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { JOB_BUILDER_COPY, LIMITS, OTHER_SUB_SERVICE } from "@/lib/constants";
import type { Category } from "@/lib/types";

/** The sub-service fields of a form (other fields may exist alongside). */
export type SubServicesFormValues = {
  subServices: string[];
  otherText?: string;
};

export type SubServicesForm = UseFormReturn<SubServicesFormValues, unknown, FieldValues>;

type SubServicesFieldProps = {
  form: SubServicesForm;
  category: Category;
  /** Id of the heading that names the checkbox group. */
  labelledBy: string;
  errorId?: string;
  otherId?: string;
};

const COPY = JOB_BUILDER_COPY.services;

/**
 * The category's sub-services as a checkbox group of cards, plus the
 * "Other" text field while "Other" is ticked (T6 step 2; reused by T8 Edit
 * job). Ticking keeps the category's order.
 */
export function SubServicesField({
  form,
  category,
  labelledBy,
  errorId = "subServices-error",
  otherId = "otherText",
}: SubServicesFieldProps) {
  const subServices = useWatch({ control: form.control, name: "subServices" });
  const { errors } = useFormState({ control: form.control, name: ["subServices", "otherText"] });
  const servicesError = errors.subServices?.message;
  const otherSelected = (subServices ?? []).includes(OTHER_SUB_SERVICE);

  return (
    <div className="flex flex-col gap-4">
      <Controller
        control={form.control}
        name="subServices"
        render={({ field }) => {
          const selected = field.value ?? [];
          return (
            <div
              role="group"
              aria-labelledby={labelledBy}
              aria-describedby={servicesError ? errorId : undefined}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {category.subServices.map((service, index) => {
                const isOther = service === OTHER_SUB_SERVICE;
                const checked = selected.includes(service);
                return (
                  <React.Fragment key={service}>
                    <SelectableCard
                      ref={index === 0 ? field.ref : undefined}
                      type="checkbox"
                      layout="row"
                      value={service}
                      title={service}
                      checked={checked}
                      onCheckedChange={(next) => {
                        const updated = next
                          ? category.subServices.filter(
                              (item) => item === service || selected.includes(item),
                            )
                          : selected.filter((item) => item !== service);
                        field.onChange(updated);
                        if (isOther && !next) form.clearErrors("otherText");
                      }}
                      onBlur={field.onBlur}
                      invalid={!!servicesError && !checked}
                      describedBy={servicesError ? errorId : undefined}
                      controls={isOther ? otherId : undefined}
                    />
                    {isOther && otherSelected && (
                      <FormField
                        id={otherId}
                        label={COPY.otherLabel}
                        hint={COPY.otherHint}
                        error={errors.otherText?.message}
                        className="sm:col-span-2"
                      >
                        {(control) => (
                          <Input
                            id={control.id}
                            aria-describedby={control.describedBy}
                            aria-invalid={control.invalid || undefined}
                            maxLength={LIMITS.otherTextMax}
                            autoComplete="off"
                            {...form.register("otherText")}
                          />
                        )}
                      </FormField>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          );
        }}
      />
      {servicesError && <FieldError id={errorId} message={servicesError} />}
    </div>
  );
}

"use client";

import * as React from "react";
import { useFormState, useWatch, type FieldValues, type UseFormReturn } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { Textarea } from "@/components/ui/textarea";
import { JOB_BUILDER_COPY, LIMITS } from "@/lib/constants";

/** The description field of a form (other fields may exist alongside). */
export type DescriptionFormValues = { description: string };

export type DescriptionForm = UseFormReturn<DescriptionFormValues, unknown, FieldValues>;

type DescriptionFieldProps = {
  form: DescriptionForm;
  id?: string;
};

const COPY = JOB_BUILDER_COPY.details;
const ANNOUNCE_DELAY_MS = 1000;

/**
 * "Describe the job" with the live counter and a delayed screen-reader
 * announcement of the count (T6 step 4; reused by T8 Edit job).
 */
export function DescriptionField({ form, id = "description" }: DescriptionFieldProps) {
  const description = useWatch({ control: form.control, name: "description" });
  const { errors } = useFormState({ control: form.control, name: "description" });
  const counterId = `${id}-count`;
  const descriptionLength = (description ?? "").length;

  const [counterAnnouncement, setCounterAnnouncement] = React.useState("");
  React.useEffect(() => {
    const timer = setTimeout(
      () => setCounterAnnouncement(COPY.counterLive(descriptionLength, LIMITS.descriptionMax)),
      ANNOUNCE_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [descriptionLength]);

  return (
    <div>
      <FormField
        id={id}
        label={COPY.descriptionLabel}
        hint={COPY.descriptionHint}
        error={errors.description?.message}
        describedByExtra={counterId}
      >
        {(control) => (
          <>
            <Textarea
              id={control.id}
              rows={5}
              maxLength={LIMITS.descriptionMax}
              aria-required
              aria-describedby={control.describedBy}
              aria-invalid={control.invalid || undefined}
              {...form.register("description")}
            />
            <p id={counterId} className="text-right text-body-sm text-ink-muted">
              {COPY.counter(descriptionLength, LIMITS.descriptionMax)}
            </p>
          </>
        )}
      </FormField>
      <span className="sr-only" aria-live="polite">
        {counterAnnouncement}
      </span>
    </div>
  );
}

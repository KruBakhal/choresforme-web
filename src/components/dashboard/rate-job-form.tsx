"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import type { z } from "zod";

import { FormAlert, nextAlertKey } from "@/components/forms/form-alert";
import { StarRatingField } from "@/components/forms/star-rating-field";
import { Button } from "@/components/ui/button";
import { DASHBOARD_COPY, LIMITS, SERVICE_MESSAGES } from "@/lib/constants";
import { isServiceError, jobs as jobService } from "@/lib/mock/services";
import type { Job } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ratingFormSchema, zodResolver } from "@/lib/validation";

type Values = { stars?: number };
type Output = z.output<typeof ratingFormSchema>;

/** The form starts with no star chosen; the schema requires one. */
const ratingResolver = zodResolver(ratingFormSchema) as unknown as Resolver<
  Values,
  unknown,
  Output
>;

type RateJobFormProps = {
  job: Job;
  /** "Jordan M.", or null when the worker is unknown. */
  workerName: string | null;
  /** Called with the rated job. */
  onRated: (job: Job) => void;
  /** NOT_ALLOWED (already rated): the parent reloads the job. */
  onNotAllowed: () => void;
};

const COPY = DASHBOARD_COPY.rate;
export const RATE_TITLE_ID = "rate-title";
const RESULT_ID = "rate-result";

/**
 * "Rate this job" on a completed job (`#rate`, T8 decision 4): once only.
 * After rating, or when the job was already rated, a read-only "You rated N
 * stars" replaces the form.
 */
export function RateJobForm({ job, workerName, onRated, onNotAllowed }: RateJobFormProps) {
  const [submitting, setSubmitting] = React.useState(false);
  const [alertKey, setAlertKey] = React.useState(0);
  // The result takes focus after a rating here (or after NOT_ALLOWED), not on page load.
  const [focusResult, setFocusResult] = React.useState(false);
  const resultRef = React.useRef<HTMLParagraphElement>(null);
  const rated = job.customerRating;

  const form = useForm<Values, unknown, Output>({
    resolver: ratingResolver,
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: { stars: undefined },
  });

  React.useEffect(() => {
    if (rated !== undefined && focusResult) resultRef.current?.focus();
  }, [rated, focusResult]);

  async function onValid(output: Output) {
    if (submitting) return;
    setSubmitting(true);
    setAlertKey(0);
    try {
      const updated = await jobService.rate(job.id, output.stars);
      setFocusResult(true);
      onRated(updated);
    } catch (caught) {
      setSubmitting(false);
      if (isServiceError(caught) && caught.code === "NOT_ALLOWED") {
        setFocusResult(true);
        onNotAllowed();
        return;
      }
      setAlertKey(nextAlertKey());
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    void form.handleSubmit(onValid, () => form.setFocus("stars"))(event);
  }

  return (
    <section
      id="rate"
      aria-labelledby={RATE_TITLE_ID}
      className="scroll-mt-24 rounded-lg border border-border bg-surface p-4 md:scroll-mt-8 md:p-6"
    >
      <h2
        id={RATE_TITLE_ID}
        tabIndex={-1}
        className="text-h4 font-semibold text-ink outline-none focus-visible:outline-2"
      >
        {COPY.title}
      </h2>
      {rated !== undefined ? (
        <p
          ref={resultRef}
          id={RESULT_ID}
          tabIndex={-1}
          role="status"
          className="mt-4 flex flex-wrap items-center gap-3 text-body font-semibold text-ink outline-none focus-visible:outline-2"
        >
          <span aria-hidden className="flex gap-1">
            {Array.from({ length: LIMITS.ratingMax }, (_, i) => (
              <Star
                key={i}
                className={cn("size-5", i < rated ? "fill-warning text-warning" : "text-ink-muted")}
              />
            ))}
          </span>
          {COPY.result(rated)}
        </p>
      ) : (
        <>
          {alertKey > 0 && (
            <FormAlert
              key={alertKey}
              tone="error"
              message={SERVICE_MESSAGES.mockError}
              className="mt-4"
            />
          )}
          <form noValidate onSubmit={onSubmit} className="mt-4 flex flex-col gap-6">
            <Controller
              control={form.control}
              name="stars"
              render={({ field, fieldState }) => (
                <StarRatingField
                  name={field.name}
                  legend={workerName ? COPY.legend(workerName) : COPY.legendFallback}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    if (fieldState.error) form.clearErrors("stars");
                  }}
                  onBlur={field.onBlur}
                  focusRef={field.ref}
                  error={fieldState.error?.message}
                  disabled={submitting}
                />
              )}
            />
            <Button type="submit" className="w-full sm:w-auto sm:self-start" loading={submitting}>
              {submitting ? COPY.submitting : COPY.submit}
            </Button>
          </form>
        </>
      )}
    </section>
  );
}

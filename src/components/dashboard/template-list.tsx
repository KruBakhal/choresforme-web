"use client";

import { Repeat } from "lucide-react";

import { FieldError } from "@/components/forms/form-field";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { CATEGORY_ICONS, DASHBOARD_COPY } from "@/lib/constants";
import { findCategory, formatUsd, jobPrice } from "@/lib/job-builder";
import type { Template } from "@/lib/types";
import { cn } from "@/lib/utils";

export type TemplatesState =
  | { status: "loading" }
  | { status: "error"; retrying: boolean }
  | { status: "ready"; templates: Template[] };

type TemplateListProps = {
  state: TemplatesState;
  onRetry: () => void;
  onRepost: (template: Template) => void;
  /** The template whose Re-post shows "Opening…". */
  repostingId?: string | null;
  /** `rail`: Home's right rail; `section`: an Account section card. */
  variant: "rail" | "section";
  titleId?: string;
  className?: string;
};

const COPY = DASHBOARD_COPY.templates;

/**
 * Saved Templates with Re-post (Tech Spec "Saved Templates": skeleton rows,
 * section hidden when empty, inline error, list). Presentational: the parent
 * loads `templates.list`. Every state sits inside a surface card.
 */
export function TemplateList({
  state,
  onRetry,
  onRepost,
  repostingId,
  variant,
  titleId = "templates-title",
  className,
}: TemplateListProps) {
  if (state.status === "ready" && state.templates.length === 0) return null;

  const section = variant === "section";
  const title = (
    <h2
      id={titleId}
      tabIndex={-1}
      className="text-h4 font-semibold text-ink outline-none focus-visible:outline-2"
    >
      {COPY.title}
    </h2>
  );

  return (
    <section
      aria-labelledby={titleId}
      className={cn(section && "rounded-lg border border-border bg-surface p-4 md:p-6", className)}
    >
      {title}
      <div className={cn("mt-4", !section && "rounded-lg border border-border bg-surface")}>
        {state.status === "loading" && (
          <LoadingState
            variant="rows"
            count={2}
            label={COPY.loading}
            className="*:*:rounded-none *:*:border-0"
          />
        )}
        {state.status === "error" && (
          <div role="alert" className={cn("flex flex-col items-start gap-2", !section && "p-4")}>
            <FieldError id={`${titleId}-error`} message={COPY.error} />
            <Button
              type="button"
              variant="link"
              size="sm"
              loading={state.retrying}
              onClick={onRetry}
            >
              {state.retrying ? DASHBOARD_COPY.templates.retrying : COPY.retry}
            </Button>
          </div>
        )}
        {state.status === "ready" && (
          <ul className="divide-y divide-border">
            {state.templates.map((template) => (
              <TemplateRow
                key={template.id}
                template={template}
                section={section}
                reposting={repostingId === template.id}
                disabled={!!repostingId && repostingId !== template.id}
                onRepost={() => onRepost(template)}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function TemplateRow({
  template,
  section,
  reposting,
  disabled,
  onRepost,
}: {
  template: Template;
  section: boolean;
  reposting: boolean;
  disabled: boolean;
  onRepost: () => void;
}) {
  const category = template.job.category ? findCategory(template.job.category) : undefined;
  const CategoryIcon = template.job.category ? CATEGORY_ICONS[template.job.category] : null;
  const price =
    template.job.amount !== undefined
      ? jobPrice({
          pricingType: template.job.pricingType ?? "fixed",
          amount: template.job.amount,
          hours: template.job.hours,
        })
      : null;
  const priceText = price
    ? template.job.pricingType === "hourly"
      ? price.breakdown
      : price.total !== null
        ? formatUsd(price.total)
        : null
    : null;

  return (
    <li className={cn("flex items-start gap-4 py-4", section ? "first:pt-0 last:pb-0" : "px-4")}>
      <div className="min-w-0 flex-1">
        <p className="text-body font-semibold break-words text-ink">{template.name}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-body-sm text-ink-muted">
          {CategoryIcon && <CategoryIcon className="size-4 shrink-0" aria-hidden />}
          {category && <span>{category.name}</span>}
          {priceText && <span>· {priceText}</span>}
        </p>
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="shrink-0"
        loading={reposting}
        disabled={disabled}
        onClick={onRepost}
      >
        {!reposting && <Repeat aria-hidden />}
        {reposting ? COPY.reposting : COPY.repost}
        <span className="sr-only">{COPY.repostSr(template.name)}</span>
      </Button>
    </li>
  );
}

"use client";

import * as React from "react";

import { FieldError } from "@/components/forms/form-field";
import { ExternalLink } from "@/components/marketing/external-link";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AUTH_COPY, FOOTER } from "@/lib/constants";

type TermsFieldProps = {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
};

const linkClass =
  "inline-flex min-h-11 items-center gap-1 text-ink underline underline-offset-4 align-middle";

/**
 * One Terms and Privacy checkbox (PRD). The links sit outside the label, so
 * tapping a link never toggles the box; they open in a new tab so a
 * half-filled form is not lost.
 */
export function TermsField({
  id = "terms",
  checked,
  onCheckedChange,
  onBlur,
  error,
  disabled,
  ref,
}: TermsFieldProps) {
  const linksId = `${id}-links`;
  const errorId = `${id}-error`;

  return (
    <div className="flex items-start gap-1">
      <Checkbox
        ref={ref}
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        onBlur={onBlur}
        disabled={disabled}
        aria-describedby={error ? `${linksId} ${errorId}` : linksId}
        aria-invalid={error ? true : undefined}
        aria-required="true"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1 pt-2">
        <Label htmlFor={id} className="text-body font-normal">
          {AUTH_COPY.fields.termsLabel}
        </Label>
        <p id={linksId} className="text-body-sm text-ink-muted">
          {AUTH_COPY.fields.termsLinksLead}{" "}
          <ExternalLink href={FOOTER.terms.href} showIcon={false} className={linkClass}>
            {FOOTER.terms.label}
          </ExternalLink>{" "}
          {AUTH_COPY.fields.termsLinksJoin}{" "}
          <ExternalLink href={FOOTER.privacy.href} showIcon={false} className={linkClass}>
            {FOOTER.privacy.label}
          </ExternalLink>
        </p>
        {error && <FieldError id={errorId} message={error} />}
      </div>
    </div>
  );
}

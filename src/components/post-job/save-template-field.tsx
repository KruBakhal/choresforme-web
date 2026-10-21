"use client";

import * as React from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JOB_BUILDER_COPY, LIMITS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type NameProps = {
  /** The name input's id (also its RHF field for `setFocus`). */
  nameId: string;
  nameProps: UseFormRegisterReturn;
  nameError?: string;
  readOnly?: boolean;
  className?: string;
};

type SaveTemplateFieldProps =
  | (NameProps & {
      /** Step 6: the checkbox, and the name field once it is ticked. */
      variant: "checkbox";
      checked: boolean;
      onCheckedChange: (checked: boolean) => void;
    })
  | (NameProps & {
      /** Step 8 offer: the name field only (the caller adds the Save button). */
      variant: "nameOnly";
    });

const COPY = JOB_BUILDER_COPY.review;
const CHECKBOX_ID = "save-template";
const HINT_ID = "save-template-hint";

/**
 * Save As Template (T7): "Template name | Required when Save As Template is
 * ticked, 3–40 characters | 'Name this template'" (Tech Spec).
 */
export function SaveTemplateField(props: SaveTemplateFieldProps) {
  const { nameId, nameProps, nameError, readOnly = false, className } = props;
  const fieldWrapperId = `${nameId}-field`;

  const nameField = (
    <FormField
      id={nameId}
      label={COPY.templateNameLabel}
      hint={COPY.templateNameHint}
      error={nameError}
      className={props.variant === "nameOnly" ? className : undefined}
    >
      {({ id, describedBy, invalid }) => (
        <Input
          id={id}
          maxLength={LIMITS.templateNameMax}
          autoComplete="off"
          readOnly={readOnly}
          aria-required="true"
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={props.variant === "checkbox" ? "sm:max-w-sm" : undefined}
          {...nameProps}
        />
      )}
    </FormField>
  );

  if (props.variant === "nameOnly") return nameField;

  return (
    <div className={cn("rounded-lg border border-border bg-surface p-4 md:p-6", className)}>
      <div className="flex items-start gap-1">
        <Checkbox
          id={CHECKBOX_ID}
          checked={props.checked}
          onCheckedChange={(value) => props.onCheckedChange(value === true)}
          aria-describedby={HINT_ID}
          aria-controls={fieldWrapperId}
        />
        <div className="min-w-0 flex-1 pt-2">
          <Label htmlFor={CHECKBOX_ID} className="text-body">
            {COPY.templateLabel}
          </Label>
          <p id={HINT_ID} className="mt-1 text-body-sm text-ink-muted">
            {COPY.templateHint}
          </p>
        </div>
      </div>
      <div id={fieldWrapperId} hidden={!props.checked} className="mt-4 pl-12">
        {props.checked && nameField}
      </div>
    </div>
  );
}

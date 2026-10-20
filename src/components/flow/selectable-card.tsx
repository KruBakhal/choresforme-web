"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Checkbox as CheckboxPrimitive, RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { CardIndicator, selectableCardClasses } from "@/components/flow/card-indicator";
import { cn } from "@/lib/utils";

export type SelectableCardProps = {
  /** Radio inside a `RadioGroup`, or checkbox inside a `role="group"`. */
  type: "radio" | "checkbox";
  value: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  layout: "tile" | "row";
  invalid?: boolean;
  /** The group error id while an error shows. */
  describedBy?: string;
  /** For example "Other" → the id of its text field. */
  controls?: string;
  disabled?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  /** Checkbox only. */
  checked?: boolean;
  /** Checkbox only. */
  onCheckedChange?: (checked: boolean) => void;
};

/**
 * A card that is the control (T6): a radio inside a `RadioGroup` (category,
 * match type) or a checkbox inside a `role="group"` (services). The title is
 * its name and the description its description; selection shows as a filled
 * indicator with a check, a dark border and a tinted background.
 */
export function SelectableCard({
  type,
  value,
  title,
  description,
  icon: Icon,
  layout,
  invalid,
  describedBy,
  controls,
  disabled,
  ref,
  onBlur,
  checked,
  onCheckedChange,
}: SelectableCardProps) {
  const id = React.useId();
  const titleId = `${id}-title`;
  const descId = description ? `${id}-desc` : undefined;
  const ariaDescribedBy = [descId, describedBy].filter(Boolean).join(" ") || undefined;

  const tile = layout === "tile";

  const content = (
    <>
      {!tile && <CardIndicator type={type} />}
      {Icon && (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand md:size-12">
          <Icon className="size-5 text-brand-foreground md:size-6" aria-hidden />
        </span>
      )}
      <span className={cn("flex min-w-0 flex-1 flex-col gap-1", tile && "pr-8")}>
        <span id={titleId} className={cn("text-body font-semibold text-ink", tile && "md:text-h4")}>
          {title}
        </span>
        {description && (
          <span id={descId} className="text-body-sm text-ink-muted">
            {description}
          </span>
        )}
      </span>
      {tile && <CardIndicator type={type} className="absolute top-4 right-4 sm:top-6 sm:right-6" />}
    </>
  );

  const className = cn(
    selectableCardClasses(invalid),
    tile
      ? "min-h-24 flex-row items-start gap-4 p-4 sm:flex-col sm:p-6"
      : "min-h-14 flex-row items-center gap-4 px-4 py-3",
  );

  const shared = {
    value,
    disabled,
    onBlur,
    className,
    "aria-labelledby": titleId,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": invalid || undefined,
    "aria-controls": controls,
    // Radix ignores Enter on radios and checkboxes; let it submit the step (Continue).
    onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter") event.currentTarget.closest("form")?.requestSubmit();
    },
  };

  if (type === "radio") {
    return (
      <RadioGroupPrimitive.Item ref={ref} {...shared}>
        {content}
      </RadioGroupPrimitive.Item>
    );
  }

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      {...shared}
      checked={checked}
      onCheckedChange={(next) => onCheckedChange?.(next === true)}
    >
      {content}
    </CheckboxPrimitive.Root>
  );
}

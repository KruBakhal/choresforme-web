"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Radix radio group: one Tab stop per group, arrow keys move and check,
 * Space checks. Callers set the layout through `className`.
 */
function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

/**
 * Classic radio: a 44 px hit area (the Radix item) around a 24 px circle,
 * the same build as `Checkbox`. Card and segment radios render
 * `RadioGroupPrimitive.Item` with their own classes instead.
 */
function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "group/radio flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className="flex size-6 items-center justify-center rounded-full border-2 border-input bg-surface transition-colors duration-150 group-data-[state=checked]/radio:bg-brand group-aria-invalid/radio:border-danger motion-reduce:transition-none"
      >
        <RadioGroupPrimitive.Indicator
          data-slot="radio-group-indicator"
          className="flex items-center justify-center"
        >
          <CheckIcon className="size-4 text-brand-foreground" />
        </RadioGroupPrimitive.Indicator>
      </span>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };

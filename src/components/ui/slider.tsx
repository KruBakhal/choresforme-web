"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

type SliderProps = React.ComponentProps<typeof SliderPrimitive.Root> & {
  /** Props for the single thumb (the `role="slider"` element): ref, label, value text, invalid. */
  thumbProps?: React.ComponentProps<typeof SliderPrimitive.Thumb>;
};

/**
 * Horizontal, single-thumb slider (T9, re-themed shadcn). The 44 px root is
 * the pointer target; the thumb carries the focus ring and the ARIA slider
 * semantics. The track and range are supplementary: show the value as text.
 */
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  thumbProps,
  ...props
}: SliderProps) {
  const { className: thumbClassName, ...thumbRest } = thumbProps ?? {};

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      orientation="horizontal"
      className={cn(
        "relative flex h-11 w-full touch-none items-center select-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-2 w-full grow overflow-hidden rounded-full bg-border"
      >
        <SliderPrimitive.Range data-slot="slider-range" className="absolute h-full bg-brand" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        className={cn(
          "block size-6 rounded-full border-2 border-ink bg-surface transition-colors duration-150 hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:border-danger motion-reduce:transition-none",
          thumbClassName,
        )}
        {...thumbRest}
      />
    </SliderPrimitive.Root>
  );
}

export { Slider };

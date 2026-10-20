import * as React from "react";

import { cn } from "@/lib/utils";

type VisualPanelProps = {
  tone: "brand" | "alt" | "surface";
  className?: string;
  children: React.ReactNode;
};

const toneClasses: Record<VisualPanelProps["tone"], string> = {
  brand: "bg-brand p-6 md:p-4 lg:p-8 xl:p-12",
  alt: "bg-surface-alt p-6 lg:p-8",
  surface: "border border-border bg-surface p-6 lg:p-8",
};

/** Rounded backdrop behind every illustration. Text only sits on surface-coloured children. */
export function VisualPanel({ tone, className, children }: VisualPanelProps) {
  return (
    <div
      className={cn("flex flex-col items-center gap-6 rounded-lg", toneClasses[tone], className)}
    >
      {children}
    </div>
  );
}

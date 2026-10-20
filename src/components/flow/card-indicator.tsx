import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/*
 * Shared by `SelectableCard` and `WorkerCard` (T6). Server-safe: no hooks, so
 * skeletons and server components can import this file.
 */

/** Shared card frame classes (also used by `WorkerCard`). */
export const selectableCardClasses = (invalid?: boolean) =>
  cn(
    "group/card relative flex w-full rounded-lg border-2 bg-surface text-left transition-colors duration-150 motion-reduce:transition-none",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50",
    "data-[state=checked]:border-ink data-[state=checked]:bg-brand-soft",
    invalid
      ? "border-danger hover:bg-surface-alt"
      : "border-border hover:border-input hover:bg-surface-alt",
    "data-[state=checked]:hover:bg-brand-soft",
  );

/** The radio circle or checkbox square in a card; fills with a check when selected. */
export function CardIndicator({
  type,
  className,
}: {
  type: "radio" | "checkbox";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-6 shrink-0 items-center justify-center border-2 border-input bg-surface transition-colors duration-150 group-data-[state=checked]/card:bg-brand motion-reduce:transition-none",
        type === "radio" ? "rounded-full" : "rounded-sm",
        className,
      )}
    >
      <Check className="hidden size-4 text-brand-foreground group-data-[state=checked]/card:block" />
    </span>
  );
}

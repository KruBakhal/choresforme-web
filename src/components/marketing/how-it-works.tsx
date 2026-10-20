import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { MarketingStep } from "@/lib/constants";
import { cn } from "@/lib/utils";

type HowItWorksProps = {
  /** 3 or 4 steps. */
  steps: readonly MarketingStep[];
  className?: string;
};

/** Numbered steps: columns joined by a line on desktop, a vertical list on mobile. */
export function HowItWorks({ steps, className }: HowItWorksProps) {
  const gridClass =
    steps.length === 4
      ? "grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:gap-8"
      : "grid grid-cols-1 gap-0 md:grid-cols-3 md:gap-6 lg:gap-8";

  return (
    <ol className={cn(gridClass, className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li
            key={step.title}
            className="relative flex gap-4 pb-8 last:pb-0 md:flex-col md:gap-0 md:pb-0"
          >
            <span
              aria-hidden
              className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-h4 font-semibold text-brand-foreground"
            >
              {index + 1}
            </span>
            {!isLast && (
              <>
                <span
                  aria-hidden
                  className="absolute top-6 -right-4 left-16 hidden h-px bg-input lg:block"
                />
                <span
                  aria-hidden
                  className="absolute top-12 bottom-0 left-6 w-px bg-input md:hidden"
                />
              </>
            )}
            <div className="min-w-0 md:mt-6">
              <h3 className="text-h4">{step.title}</h3>
              <p className="mt-2 text-body text-ink-muted">{step.body}</p>
              {step.href && step.linkLabel && (
                <Button asChild variant="link" size="sm" className="mt-2">
                  <Link href={step.href}>
                    {step.linkLabel}
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

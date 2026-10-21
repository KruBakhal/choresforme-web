import * as React from "react";
import { Inbox, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Usually a `Button`. Full width on mobile. */
  action?: React.ReactNode;
  /** 1 when the state is the whole page (T7 Confirmation); same look. */
  headingLevel?: 1 | 2 | 3 | 4;
  className?: string;
};

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  headingLevel = 2,
  className,
}: EmptyStateProps) {
  const Heading =
    headingLevel === 4 ? "h4" : headingLevel === 3 ? "h3" : headingLevel === 1 ? "h1" : "h2";

  return (
    <div
      className={cn(
        "w-full rounded-lg border border-border bg-surface px-4 py-12 md:px-6 md:py-16",
        className,
      )}
    >
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-ink">
          <Icon className="size-6" aria-hidden />
        </span>
        <Heading className="mt-4 text-h4 font-semibold text-ink">{title}</Heading>
        {description && <p className="mt-2 text-body text-ink-muted">{description}</p>}
        {action && (
          <div className="mt-6 flex w-full justify-center *:w-full sm:w-auto sm:*:w-auto">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

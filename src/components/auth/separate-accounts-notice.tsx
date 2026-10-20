"use client";

import * as React from "react";
import { UsersRound } from "lucide-react";

import { AUTH_COPY } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SeparateAccountsNoticeProps = {
  /** `page`: centred card with an h1 or h2. `inline`: inside the social dialog. */
  variant: "page" | "inline";
  headingLevel: 1 | 2 | 3;
  /** Defaults to "Customer and worker accounts are separate". */
  title?: string;
  body: string;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  /** Shown under the actions (for example a logout error). */
  alert?: React.ReactNode;
  /** Focus the heading on mount (client-side renders only). */
  focusOnMount?: boolean;
};

/**
 * "Customer and worker accounts are separate" (PRD: one role per account).
 * Informational, so not role="alert".
 */
export function SeparateAccountsNotice({
  variant,
  headingLevel,
  title = AUTH_COPY.separate.title,
  body,
  primary,
  secondary,
  alert,
  focusOnMount = false,
}: SeparateAccountsNoticeProps) {
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const Heading = headingLevel === 1 ? "h1" : headingLevel === 2 ? "h2" : "h3";

  React.useEffect(() => {
    if (focusOnMount) headingRef.current?.focus();
  }, [focusOnMount]);

  if (variant === "inline") {
    return (
      <div className="flex flex-col gap-4">
        <span className="flex size-10 items-center justify-center rounded-full bg-brand-soft">
          <UsersRound className="size-5 text-ink" aria-hidden />
        </span>
        <div className="flex flex-col gap-2">
          <Heading
            ref={headingRef}
            tabIndex={-1}
            className="text-h4 outline-none focus-visible:outline-2"
          >
            {title}
          </Heading>
          <p className="text-body-sm text-ink-muted">{body}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {secondary}
          {primary}
        </div>
        {alert}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-lg border border-border bg-surface px-4 py-12 text-center md:px-8 md:py-16">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-soft">
        <UsersRound className="size-6 text-ink" aria-hidden />
      </span>
      <Heading
        ref={headingRef}
        tabIndex={-1}
        className={cn(
          "mt-4 outline-none focus-visible:outline-2",
          headingLevel === 1 ? "text-h3 md:text-h2" : "text-h3",
        )}
      >
        {title}
      </Heading>
      <p className="mt-2 text-body text-ink-muted">{body}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {primary}
        {secondary}
      </div>
      {alert && <div className="mt-6 text-left">{alert}</div>}
    </div>
  );
}

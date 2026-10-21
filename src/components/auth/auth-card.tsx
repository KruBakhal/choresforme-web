import * as React from "react";

import { cn } from "@/lib/utils";

type AuthCardProps = {
  /** Id of the h1; the page focuses it after a client-side view change. */
  titleId: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Above the title (the role chip on sign-up). */
  eyebrow?: React.ReactNode;
  /** The inline message above the form (`FormAlert`). */
  alert?: React.ReactNode;
  /** Under a rule at the bottom ("Already have an account? Log in"). */
  footer?: React.ReactNode;
  /** 1 (default) on auth pages; 2 inside another page (T7 Review's inline card). */
  headingLevel?: 1 | 2;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Auth card: card chrome from md, a plain full-width form on phones. Holds
 * the page's one h1 (or an h2 when embedded, T7), the alert slot above the
 * form and the footer links.
 */
export function AuthCard({
  titleId,
  title,
  description,
  eyebrow,
  alert,
  footer,
  headingLevel = 1,
  className,
  children,
}: AuthCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h1";
  return (
    <div
      className={cn(
        "w-full md:rounded-lg md:border md:border-border md:bg-surface md:p-8 xl:p-12",
        className,
      )}
    >
      {eyebrow && <div className="mb-4">{eyebrow}</div>}
      <Heading
        id={titleId}
        tabIndex={-1}
        className={cn(
          "text-h3 outline-none focus-visible:outline-2",
          headingLevel === 1 && "md:text-h2",
        )}
      >
        {title}
      </Heading>
      {description && <div className="mt-2 text-body text-ink-muted">{description}</div>}
      {alert && <div className="mt-6">{alert}</div>}
      {children && <div className="mt-6 md:mt-8">{children}</div>}
      {footer && (
        <div className="mt-8 border-t border-border pt-6 text-body-sm text-ink">{footer}</div>
      )}
    </div>
  );
}

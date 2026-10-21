import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const PAGE_TITLE_ID = "page-title";

type PageHeaderProps = {
  title: string;
  description?: React.ReactNode;
  titleRef?: React.Ref<HTMLHeadingElement>;
  /** Job detail and Edit: "Back to jobs" and so on. */
  back?: { href: string; label: string };
  /** Above the h1 (Job detail: status badge and reference). */
  eyebrow?: React.ReactNode;
  /** After the description (Jobs: the History link). */
  children?: React.ReactNode;
  className?: string;
};

/**
 * The T8 page header (UI plan §0.4): optional back link, the page `h1`
 * (`#page-title`, focusable for route-change focus) and a one-line
 * description.
 */
export function PageHeader({
  title,
  description,
  titleRef,
  back,
  eyebrow,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("mb-8 flex flex-col gap-2", className)}>
      {back && (
        <Button asChild variant="link" size="sm" className="min-h-11 self-start">
          <Link href={back.href}>
            <ArrowLeft className="size-4" aria-hidden />
            {back.label}
          </Link>
        </Button>
      )}
      {eyebrow}
      <h1
        ref={titleRef}
        id={PAGE_TITLE_ID}
        tabIndex={-1}
        className="text-h3 break-words outline-none focus-visible:outline-2 md:text-h2"
      >
        {title}
      </h1>
      {description && <div className="text-body text-ink-muted">{description}</div>}
      {children}
    </header>
  );
}

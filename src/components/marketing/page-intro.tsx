import * as React from "react";

import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { MarketingSection } from "@/components/marketing/marketing-section";
import type { LinkItem } from "@/lib/constants";
import { cn } from "@/lib/utils";

type PageIntroProps = {
  titleId: string;
  title: string;
  eyebrow?: string;
  intro?: string;
  breadcrumb?: readonly LinkItem[];
  actions?: React.ReactNode;
  visual?: React.ReactNode;
};

/** The h1 band at the top of every marketing page except the landing page. */
export function PageIntro({
  titleId,
  title,
  eyebrow,
  intro,
  breadcrumb,
  actions,
  visual,
}: PageIntroProps) {
  const text = (
    <div className={cn("min-w-0", visual ? "md:col-span-5 lg:col-span-7" : "max-w-3xl")}>
      {breadcrumb && (
        <div className="mb-4">
          <Breadcrumbs items={breadcrumb} />
        </div>
      )}
      {eyebrow && <p className="text-body-sm font-semibold text-ink-muted">{eyebrow}</p>}
      <h1 id={titleId} className={cn(eyebrow && "mt-2")}>
        {title}
      </h1>
      {intro && <p className="mt-4 max-w-2xl text-body text-ink-muted">{intro}</p>}
      {actions && (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>
      )}
    </div>
  );

  return (
    <MarketingSection tone="surface" spacing="intro" labelledBy={titleId}>
      {visual ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-8 md:items-center md:gap-6 lg:grid-cols-12 lg:gap-8">
          {text}
          <div className="min-w-0 md:col-span-3 lg:col-span-5">{visual}</div>
        </div>
      ) : (
        text
      )}
    </MarketingSection>
  );
}

import Link from "next/link";
import { Info } from "lucide-react";

import { SupportEmailText } from "@/components/layout/support-email-text";
import { ExternalLink } from "@/components/marketing/external-link";
import { MarketingSection } from "@/components/marketing/marketing-section";
import { Button } from "@/components/ui/button";
import { FOOTER, LEGAL_COPY, SUPPORT_EMAIL } from "@/lib/constants";

type LegalPlaceholderProps = { kind: "privacy" | "terms" };

/** Placeholder legal page: links to the current policy; no legal text is copied or invented. */
export function LegalPlaceholder({ kind }: LegalPlaceholderProps) {
  const copy = LEGAL_COPY[kind];
  const other = kind === "privacy" ? FOOTER.terms : FOOTER.privacy;

  return (
    <MarketingSection tone="surface" labelledBy="legal-title">
      <div className="max-w-2xl">
        <p className="text-body-sm font-semibold text-ink-muted">{LEGAL_COPY.eyebrow}</p>
        <h1 id="legal-title" className="mt-2">
          {copy.title}
        </h1>

        <div className="mt-8 flex gap-4 rounded-lg border border-border bg-surface-alt p-4 md:p-6">
          <Info className="size-6 shrink-0 text-ink" aria-hidden />
          <div className="min-w-0">
            <p className="text-body text-ink">{LEGAL_COPY.notice}</p>
            <Button asChild variant="link" size="sm" className="mt-3 whitespace-normal">
              <ExternalLink href={copy.currentHref}>{copy.currentLabel}</ExternalLink>
            </Button>
          </div>
        </div>

        <p className="mt-8 text-body text-ink-muted">
          {LEGAL_COPY.questions}{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex min-h-11 items-center rounded-md break-words text-ink underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            <span className="min-w-0">
              <SupportEmailText />
            </span>
          </a>
        </p>

        <Button asChild variant="link" className="mt-4">
          <Link href={other.href}>{other.label}</Link>
        </Button>
      </div>
    </MarketingSection>
  );
}

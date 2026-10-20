import type { Metadata } from "next";
import Link from "next/link";

import { CtaBand } from "@/components/marketing/cta-band";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { MarketingSection } from "@/components/marketing/marketing-section";
import { PageIntro } from "@/components/marketing/page-intro";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Button } from "@/components/ui/button";
import {
  A11Y,
  HEADER_ACTIONS,
  HOW_IT_WORKS_COPY as COPY,
  LANDING_COPY,
  MARKETING_META,
  WORKER_SIGNUP_HREF,
} from "@/lib/constants";

export const metadata: Metadata = MARKETING_META.howItWorks;

export default function HowItWorksPage() {
  const { ctaBand } = LANDING_COPY;

  return (
    <>
      <PageIntro
        titleId="hiw-title"
        title={COPY.title}
        intro={COPY.intro}
        actions={
          <nav aria-label={A11Y.onThisPage} className="flex flex-wrap gap-3">
            {COPY.jumpLinks.map((link) => (
              <Button key={link.href} asChild variant="outline" size="sm">
                <a href={link.href}>{link.label}</a>
              </Button>
            ))}
          </nav>
        }
      />

      <MarketingSection id="customers" tone="alt" labelledBy="customers-title">
        <SectionHeading
          id="customers-title"
          title={COPY.customers.title}
          intro={COPY.customers.intro}
        />
        <HowItWorks steps={COPY.customers.steps} className="mt-8 md:mt-12" />
        <Button asChild size="lg" className="mt-12 w-full sm:w-auto">
          <Link href={HEADER_ACTIONS.postJob.href}>{COPY.customers.cta}</Link>
        </Button>
      </MarketingSection>

      <MarketingSection id="workers" tone="surface" labelledBy="workers-title">
        <SectionHeading id="workers-title" title={COPY.workers.title} intro={COPY.workers.intro} />
        <HowItWorks steps={COPY.workers.steps} className="mt-8 md:mt-12" />
        <Button asChild variant="secondary" size="lg" className="mt-12 w-full sm:w-auto">
          <Link href={WORKER_SIGNUP_HREF}>{COPY.workers.cta}</Link>
        </Button>
      </MarketingSection>

      <CtaBand
        tone="alt"
        headingId="cta-title"
        title={ctaBand.title}
        body={ctaBand.body}
        primary={ctaBand.primary}
        secondary={ctaBand.secondary}
      />
    </>
  );
}

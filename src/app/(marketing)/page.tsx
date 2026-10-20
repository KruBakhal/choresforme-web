import type { Metadata } from "next";
import Link from "next/link";

import { CategoryTiles } from "@/components/marketing/category-tiles";
import { CtaBand } from "@/components/marketing/cta-band";
import { FaqTeaser } from "@/components/marketing/faq-teaser";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { MarketingSection } from "@/components/marketing/marketing-section";
import { SectionHeading } from "@/components/marketing/section-heading";
import { TrustBlock } from "@/components/marketing/trust-block";
import { WorkerSection } from "@/components/marketing/worker-section";
import { Button } from "@/components/ui/button";
import {
  CATEGORIES,
  CATEGORY_DESCRIPTIONS,
  HOW_IT_WORKS_HREF,
  LANDING_COPY,
  MARKETING_META,
  postJobForCategory,
} from "@/lib/constants";

export const metadata: Metadata = MARKETING_META.home;

export default function HomePage() {
  const { services, howItWorks, faq, ctaBand } = LANDING_COPY;

  return (
    <>
      <Hero />

      <MarketingSection id="services" tone="alt" labelledBy="services-title">
        <SectionHeading
          id="services-title"
          eyebrow={services.eyebrow}
          title={services.title}
          intro={services.intro}
          align="center"
        />
        <CategoryTiles
          categories={CATEGORIES}
          hrefFor={postJobForCategory}
          descriptionFor={(category) => CATEGORY_DESCRIPTIONS[category.id]}
          actionLabel={services.tileAction}
          className="mt-8 md:mt-12"
        />
      </MarketingSection>

      <MarketingSection tone="surface" labelledBy="how-title">
        <SectionHeading
          id="how-title"
          eyebrow={howItWorks.eyebrow}
          title={howItWorks.title}
          intro={howItWorks.intro}
          align="center"
        />
        <HowItWorks steps={howItWorks.steps} className="mt-8 md:mt-12" />
        <div className="mt-12 flex justify-center">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={HOW_IT_WORKS_HREF}>{howItWorks.fullGuide}</Link>
          </Button>
        </div>
      </MarketingSection>

      <MarketingSection tone="alt" labelledBy="trust-title">
        <TrustBlock headingId="trust-title" />
      </MarketingSection>

      <MarketingSection tone="surface" labelledBy="workers-title">
        <WorkerSection headingId="workers-title" />
      </MarketingSection>

      <MarketingSection tone="alt" labelledBy="faq-title">
        <FaqTeaser headingId="faq-title" title={faq.title} itemIds={faq.itemIds} />
      </MarketingSection>

      <CtaBand
        tone="surface"
        headingId="cta-title"
        title={ctaBand.title}
        body={ctaBand.body}
        primary={ctaBand.primary}
        secondary={ctaBand.secondary}
      />
    </>
  );
}

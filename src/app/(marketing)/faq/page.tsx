import type { Metadata } from "next";

import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { FaqContactCard } from "@/components/marketing/faq-contact-card";
import { MarketingSection } from "@/components/marketing/marketing-section";
import { PageIntro } from "@/components/marketing/page-intro";
import { FAQ_COPY, FAQ_ITEMS, MARKETING_META } from "@/lib/constants";

export const metadata: Metadata = MARKETING_META.faq;

export default function FaqPage() {
  return (
    <>
      <PageIntro titleId="faq-title" title={FAQ_COPY.title} intro={FAQ_COPY.intro} />

      <MarketingSection tone="alt">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="min-w-0 lg:col-span-8">
            <FaqAccordion items={FAQ_ITEMS} searchable grouped anchorIds />
          </div>
          <FaqContactCard
            as="aside"
            headingLevel={2}
            className="min-w-0 lg:sticky lg:top-24 lg:col-span-4 lg:self-start"
          />
        </div>
      </MarketingSection>
    </>
  );
}

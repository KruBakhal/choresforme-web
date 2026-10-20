import Link from "next/link";

import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { FaqContactCard } from "@/components/marketing/faq-contact-card";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Button } from "@/components/ui/button";
import { FAQ_HREF, FAQ_ITEMS, LANDING_COPY, type FaqItem } from "@/lib/constants";

type FaqTeaserProps = {
  headingId: string;
  title: string;
  /** FAQ slugs to show, in this order. */
  itemIds: readonly string[];
};

/** A short FAQ set with "See all FAQs" and the contact card (/ and /workers). */
export function FaqTeaser({ headingId, title, itemIds }: FaqTeaserProps) {
  const items = itemIds
    .map((id) => FAQ_ITEMS.find((item) => item.id === id))
    .filter((item): item is FaqItem => item !== undefined);

  return (
    <>
      <SectionHeading id={headingId} title={title} />
      <div className="mt-8 grid grid-cols-1 gap-8 md:mt-12 lg:grid-cols-12 lg:gap-8">
        <div className="min-w-0 lg:col-span-8">
          <FaqAccordion items={items} />
          <Button asChild variant="outline" className="mt-6 w-full sm:w-auto">
            <Link href={FAQ_HREF}>{LANDING_COPY.faq.seeAll}</Link>
          </Button>
        </div>
        <FaqContactCard headingLevel={3} className="min-w-0 lg:col-span-4 lg:self-start" />
      </div>
    </>
  );
}

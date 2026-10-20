import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryTiles } from "@/components/marketing/category-tiles";
import { CtaBand } from "@/components/marketing/cta-band";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { MarketingSection } from "@/components/marketing/marketing-section";
import { PageIntro } from "@/components/marketing/page-intro";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ServiceIncludes } from "@/components/marketing/service-includes";
import { TrustBlock } from "@/components/marketing/trust-block";
import { VisualPanel } from "@/components/marketing/visual-panel";
import { Button } from "@/components/ui/button";
import {
  CATEGORIES,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_ICONS,
  CATEGORY_IDS,
  HOW_IT_WORKS_HREF,
  LANDING_COPY,
  SERVICE_PAGE_COPY as COPY,
  SERVICES_ANCHOR_HREF,
  postJobForCategory,
  serviceHref,
} from "@/lib/constants";
import type { Category } from "@/lib/types";

/*
 * The whole route must come from static output. Any slug not in
 * generateStaticParams then waits for its static result instead of streaming
 * the fallback shell, so `notFound()` answers with a real 404 (not a 200).
 * Reading `params` outside Suspense is therefore intended: opt out of the
 * dev-only instant-navigation check (the 4 valid pages are prerendered).
 */
export const ensureStatic = "navigation";
export const instant = false;

export function generateStaticParams() {
  return CATEGORY_IDS.map((category) => ({ category }));
}

function findCategory(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.id === slug);
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[category]">): Promise<Metadata> {
  const { category: slug } = await params;
  const category = findCategory(slug);
  if (!category) return {};
  const page = COPY.pages[category.id];
  return { title: page.metaTitle, description: page.metaDescription };
}

export default async function ServicePage({ params }: PageProps<"/services/[category]">) {
  const { category: slug } = await params;
  const category = findCategory(slug);
  if (!category) notFound();

  const page = COPY.pages[category.id];
  const Icon = CATEGORY_ICONS[category.id];
  const postHref = postJobForCategory(category.id);
  const others = CATEGORIES.filter((other) => other.id !== category.id);

  return (
    <>
      <PageIntro
        titleId="service-title"
        eyebrow={COPY.eyebrow}
        title={page.heading}
        intro={page.intro}
        breadcrumb={[
          { label: COPY.breadcrumbHome, href: "/" },
          { label: COPY.breadcrumbServices, href: SERVICES_ANCHOR_HREF },
          { label: category.name, href: serviceHref(category.id) },
        ]}
        actions={
          <>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={postHref}>{COPY.primaryCta}</Link>
            </Button>
            <Button asChild variant="link">
              <Link href={HOW_IT_WORKS_HREF}>{COPY.howLink}</Link>
            </Button>
          </>
        }
        visual={
          <VisualPanel tone="brand" className="py-12 md:py-12 lg:py-16 xl:py-16">
            <span className="flex size-24 items-center justify-center rounded-lg bg-surface">
              <Icon className="size-12 text-ink" aria-hidden />
            </span>
          </VisualPanel>
        }
      />

      <MarketingSection tone="alt" labelledBy="includes-title">
        <ServiceIncludes category={category} headingId="includes-title" />
      </MarketingSection>

      <MarketingSection tone="surface" labelledBy="how-title">
        <SectionHeading id="how-title" title={COPY.howTitle} intro={COPY.howIntro} />
        <HowItWorks steps={LANDING_COPY.howItWorks.steps} className="mt-8 md:mt-12" />
      </MarketingSection>

      <MarketingSection tone="alt" labelledBy="trust-title">
        <TrustBlock headingId="trust-title" />
      </MarketingSection>

      <MarketingSection tone="surface" labelledBy="other-title">
        <SectionHeading id="other-title" title={COPY.otherServicesTitle} />
        <CategoryTiles
          categories={others}
          layout="three"
          hrefFor={serviceHref}
          descriptionFor={(other) => CATEGORY_DESCRIPTIONS[other.id]}
          actionLabel={COPY.otherServicesAction}
          className="mt-8 md:mt-12"
        />
      </MarketingSection>

      <CtaBand
        tone="alt"
        headingId="cta-title"
        title={COPY.ctaTitle(category.name)}
        body={COPY.ctaBody}
        primary={{ label: COPY.primaryCta, href: postHref }}
        secondary={COPY.ctaSecondary}
      />
    </>
  );
}

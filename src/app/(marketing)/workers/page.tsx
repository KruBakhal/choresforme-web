import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock } from "lucide-react";

import { CategoryTiles } from "@/components/marketing/category-tiles";
import { CtaBand } from "@/components/marketing/cta-band";
import { FaqTeaser } from "@/components/marketing/faq-teaser";
import { FeatureList } from "@/components/marketing/feature-list";
import { IdCardPreview } from "@/components/marketing/id-card-preview";
import { JobBoardPreview } from "@/components/marketing/job-board-preview";
import { MarketingSection } from "@/components/marketing/marketing-section";
import { PageIntro } from "@/components/marketing/page-intro";
import { PhoneFrame } from "@/components/marketing/phone-frame";
import { SectionHeading } from "@/components/marketing/section-heading";
import { VisualPanel } from "@/components/marketing/visual-panel";
import { Button } from "@/components/ui/button";
import {
  CATEGORIES,
  MARKETING_META,
  VERIFICATION_STATUS_LABELS,
  WORKER_SIGNUP_HREF,
  WORKERS_PAGE_COPY as COPY,
} from "@/lib/constants";

export const metadata: Metadata = MARKETING_META.workers;

export default function WorkersPage() {
  return (
    <>
      <PageIntro
        titleId="workers-page-title"
        eyebrow={COPY.eyebrow}
        title={COPY.title}
        intro={COPY.intro}
        actions={
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={WORKER_SIGNUP_HREF}>{COPY.cta}</Link>
          </Button>
        }
        visual={
          <VisualPanel tone="brand">
            <PhoneFrame>
              <JobBoardPreview />
            </PhoneFrame>
          </VisualPanel>
        }
      />

      <MarketingSection tone="alt" labelledBy="why-title">
        <SectionHeading id="why-title" title={COPY.whyJoin.title} align="center" />
        <FeatureList items={COPY.whyJoin.points} layout="columns" className="mt-8 md:mt-12" />
      </MarketingSection>

      <MarketingSection tone="surface" labelledBy="jobs-title">
        <SectionHeading id="jobs-title" title={COPY.jobTypes.title} intro={COPY.jobTypes.intro} />
        <CategoryTiles
          categories={CATEGORIES}
          descriptionFor={(category) => category.subServices.join(", ")}
          className="mt-8 md:mt-12"
        />
      </MarketingSection>

      <MarketingSection tone="alt" labelledBy="needs-title">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-8 md:items-center md:gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="min-w-0 md:col-span-4 lg:col-span-6">
            <SectionHeading id="needs-title" title={COPY.needs.title} intro={COPY.needs.intro} />
            <ul className="mt-8 flex flex-col gap-4">
              {COPY.needs.items.map(({ icon: Icon, label }) => (
                <li key={label} className="flex gap-3">
                  <Icon className="mt-1 size-5 shrink-0 text-ink" aria-hidden />
                  <span className="text-body text-ink">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0 md:col-span-4 lg:col-span-6">
            <VisualPanel tone="surface">
              <IdCardPreview variant="compact" />
              <div className="flex w-full flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-input px-3 py-1 text-caption font-semibold text-ink">
                    <Clock className="size-4" aria-hidden />
                    {VERIFICATION_STATUS_LABELS.under_review}
                  </span>
                  <ArrowRight className="size-4 text-ink" aria-hidden />
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-caption font-semibold text-ink">
                    <BadgeCheck className="size-4" aria-hidden />
                    {VERIFICATION_STATUS_LABELS.verified}
                  </span>
                </div>
                <p className="text-body-sm text-ink">{COPY.statusNote}</p>
              </div>
            </VisualPanel>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="surface" labelledBy="worker-faq-title">
        <FaqTeaser headingId="worker-faq-title" title={COPY.faq.title} itemIds={COPY.faq.itemIds} />
      </MarketingSection>

      <CtaBand
        tone="alt"
        headingId="cta-title"
        title={COPY.ctaBand.title}
        body={COPY.ctaBand.body}
        primary={{ label: COPY.cta, href: WORKER_SIGNUP_HREF }}
      />
    </>
  );
}

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { HeroCategoryPicker } from "@/components/marketing/hero-category-picker";
import { IdCardPreview } from "@/components/marketing/id-card-preview";
import { MarketingSection } from "@/components/marketing/marketing-section";
import { PhoneFrame } from "@/components/marketing/phone-frame";
import { VisualPanel } from "@/components/marketing/visual-panel";
import { Button } from "@/components/ui/button";
import {
  CATEGORIES,
  CATEGORY_ICONS,
  HEADER_ACTIONS,
  LANDING_COPY,
  WORKER_SIGNUP_HREF,
} from "@/lib/constants";

const COPY = LANDING_COPY.hero;

/** Landing hero: headline, both CTAs and the category picker left; illustration right. */
export function Hero() {
  return (
    <MarketingSection tone="surface" spacing="intro" labelledBy="hero-title">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-8 md:items-center md:gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="min-w-0 md:col-span-5 lg:col-span-7">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-body-sm font-semibold text-ink">
            <ShieldCheck className="size-4 shrink-0" aria-hidden />
            {COPY.eyebrow}
          </p>
          <h1 id="hero-title" className="mt-4">
            {COPY.headline}
          </h1>
          <p className="mt-4 max-w-xl text-body text-ink-muted">{COPY.supportingLine}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={HEADER_ACTIONS.postJob.href}>{COPY.primaryCta}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href={WORKER_SIGNUP_HREF}>{COPY.secondaryCta}</Link>
            </Button>
          </div>
          <p className="mt-3 text-body-sm text-ink-muted">{COPY.noAccountNote}</p>
          <div className="mt-8">
            <HeroCategoryPicker labelId="hero-picker-label" />
          </div>
        </div>

        <div className="min-w-0 md:col-span-3 lg:col-span-5">
          <VisualPanel tone="brand">
            <PhoneFrame>
              <IdCardPreview variant="compact" />
            </PhoneFrame>
            <div aria-hidden="true" className="flex flex-wrap justify-center gap-3">
              {CATEGORIES.map((category) => {
                const Icon = CATEGORY_ICONS[category.id];
                return (
                  <span
                    key={category.id}
                    className="flex size-12 items-center justify-center rounded-md bg-surface"
                  >
                    <Icon className="size-6 text-ink" />
                  </span>
                );
              })}
            </div>
          </VisualPanel>
        </div>
      </div>
    </MarketingSection>
  );
}

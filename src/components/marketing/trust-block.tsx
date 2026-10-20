import { Star } from "lucide-react";

import { FeatureList } from "@/components/marketing/feature-list";
import { IdCardPreview } from "@/components/marketing/id-card-preview";
import { SectionHeading } from "@/components/marketing/section-heading";
import { VisualPanel } from "@/components/marketing/visual-panel";
import { LANDING_COPY } from "@/lib/constants";

type TrustBlockProps = { headingId: string };

const COPY = LANDING_COPY.trust;

/** What "verified" means: text left, ID-Card and ratings visual right. */
export function TrustBlock({ headingId }: TrustBlockProps) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-8 md:items-center md:gap-6 lg:grid-cols-12 lg:gap-8">
      <div className="min-w-0 md:col-span-4 lg:col-span-6">
        <SectionHeading id={headingId} eyebrow={COPY.eyebrow} title={COPY.title} />
        <FeatureList items={COPY.points} layout="stack" className="mt-8" />
      </div>

      <div className="min-w-0 md:col-span-4 lg:col-span-6">
        <VisualPanel tone="surface">
          <IdCardPreview variant="detailed" />
          <div aria-hidden="true" className="flex w-full flex-col gap-3">
            {COPY.ratingRows.map((row) => (
              <div
                key={row}
                className="flex items-center justify-between gap-3 rounded-md bg-surface-alt p-4"
              >
                <span className="text-body-sm font-semibold text-ink">{row}</span>
                <span className="flex shrink-0 gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="size-4 text-ink" />
                  ))}
                </span>
              </div>
            ))}
          </div>
        </VisualPanel>
      </div>
    </div>
  );
}

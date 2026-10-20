import Link from "next/link";

import { FeatureList } from "@/components/marketing/feature-list";
import { JobBoardPreview } from "@/components/marketing/job-board-preview";
import { PhoneFrame } from "@/components/marketing/phone-frame";
import { SectionHeading } from "@/components/marketing/section-heading";
import { VisualPanel } from "@/components/marketing/visual-panel";
import { Button } from "@/components/ui/button";
import { LANDING_COPY, WORKER_SIGNUP_HREF, WORKERS_HREF } from "@/lib/constants";

type WorkerSectionProps = { headingId: string };

const COPY = LANDING_COPY.workers;

/** Landing worker section. The visual sits on the left from lg up; DOM order stays text first. */
export function WorkerSection({ headingId }: WorkerSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-8 md:items-center md:gap-6 lg:grid-cols-12 lg:gap-8">
      <div className="min-w-0 md:col-span-4 lg:col-span-6">
        <SectionHeading id={headingId} eyebrow={COPY.eyebrow} title={COPY.title} />
        <FeatureList items={COPY.points} layout="stack" className="mt-8" />
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
            <Link href={WORKER_SIGNUP_HREF}>{COPY.cta}</Link>
          </Button>
          <Button asChild variant="link">
            <Link href={WORKERS_HREF}>{COPY.secondaryLink}</Link>
          </Button>
        </div>
      </div>

      <div className="min-w-0 md:col-span-4 lg:order-first lg:col-span-6">
        <VisualPanel tone="alt">
          <PhoneFrame>
            <JobBoardPreview />
          </PhoneFrame>
        </VisualPanel>
      </div>
    </div>
  );
}

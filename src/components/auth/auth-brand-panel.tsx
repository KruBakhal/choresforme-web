import { HandCoins, ShieldCheck, type LucideIcon } from "lucide-react";

import { FeatureList } from "@/components/marketing/feature-list";
import { IdCardPreview } from "@/components/marketing/id-card-preview";
import { JobBoardPreview } from "@/components/marketing/job-board-preview";
import { PhoneFrame } from "@/components/marketing/phone-frame";
import { VisualPanel } from "@/components/marketing/visual-panel";
import { AUTH_COPY, LANDING_COPY, type MarketingPoint } from "@/lib/constants";

type AuthBrandPanelProps = {
  /** `trust` on login and customer sign-up; `worker` on worker sign-up. */
  audience: "trust" | "worker";
};

const TRUST_POINT_TITLES = ["Phone check", "Identity verification", "Two-way ratings"];

const CONTENT: Record<
  AuthBrandPanelProps["audience"],
  { icon: LucideIcon; eyebrow: string; title: string; points: readonly MarketingPoint[] }
> = {
  trust: {
    icon: ShieldCheck,
    eyebrow: LANDING_COPY.trust.eyebrow,
    title: AUTH_COPY.brandPanel.trustTitle,
    points: LANDING_COPY.trust.points.filter((point) => TRUST_POINT_TITLES.includes(point.title)),
  },
  worker: {
    icon: HandCoins,
    eyebrow: LANDING_COPY.workers.eyebrow,
    title: LANDING_COPY.workers.title,
    points: LANDING_COPY.workers.points,
  },
};

/**
 * Brand panel with trust points and a visual. A right-hand column from lg; a
 * compact strip under the form below lg (decision 16: nothing removed).
 */
export function AuthBrandPanel({ audience }: AuthBrandPanelProps) {
  const { icon: Icon, eyebrow, title, points } = CONTENT[audience];

  return (
    <section
      aria-labelledby="auth-brand-title"
      className="rounded-lg bg-surface-alt p-6 lg:p-8 xl:p-12"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-8 md:items-center lg:grid-cols-1 lg:gap-8">
        <div className="min-w-0 md:col-span-5 lg:col-span-1">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-body-sm font-semibold text-ink">
            <Icon className="size-4" aria-hidden />
            {eyebrow}
          </span>
          <h2 id="auth-brand-title" className="mt-4 text-h4 lg:text-h3">
            {title}
          </h2>
          <FeatureList items={points} layout="stack" className="mt-6" />
        </div>
        <div className="min-w-0 md:col-span-3 lg:col-span-1">
          <VisualPanel tone="brand">
            {audience === "worker" ? (
              <PhoneFrame>
                <JobBoardPreview />
              </PhoneFrame>
            ) : (
              <IdCardPreview variant="compact" />
            )}
          </VisualPanel>
        </div>
      </div>
    </section>
  );
}

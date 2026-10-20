import Link from "next/link";

import { MarketingSection } from "@/components/marketing/marketing-section";
import { Button } from "@/components/ui/button";
import type { LinkItem } from "@/lib/constants";

type CtaBandProps = {
  headingId: string;
  title: string;
  body?: string;
  primary: LinkItem;
  secondary?: LinkItem;
  /** Tone of the light band around the dark panel. */
  tone: "surface" | "alt";
};

/** The page's one dark accent panel, inside a light band so it never touches the Footer. */
export function CtaBand({ headingId, title, body, primary, secondary, tone }: CtaBandProps) {
  return (
    <MarketingSection tone={tone} labelledBy={headingId}>
      <div className="flex flex-col gap-8 rounded-lg bg-surface-dark px-6 py-12 md:px-12 lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-16">
        <div className="max-w-xl">
          <h2 id={headingId} className="text-h2 text-surface">
            {title}
          </h2>
          {body && <p className="mt-4 text-body text-surface">{body}</p>}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
          <Button asChild size="lg" className="w-full focus-visible:outline-surface sm:w-auto">
            <Link href={primary.href}>{primary.label}</Link>
          </Button>
          {secondary && (
            <Button asChild variant="inverse" size="lg" className="w-full sm:w-auto">
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          )}
        </div>
      </div>
    </MarketingSection>
  );
}

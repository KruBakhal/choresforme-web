import { BadgeCheck, UserRound } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { Separator } from "@/components/ui/separator";
import { ID_CARD_PREVIEW_SAMPLE as SAMPLE, VERIFICATION_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type IdCardPreviewProps = {
  /** `detailed` adds a line of detail under each check. */
  variant?: "compact" | "detailed";
  className?: string;
};

/** Illustrative Chores ID-Card with sample content (not the T10 IdCard). */
export function IdCardPreview({ variant = "compact", className }: IdCardPreviewProps) {
  return (
    <figure
      aria-label={SAMPLE.ariaLabel}
      className={cn(
        "w-full min-w-0 rounded-lg border border-border bg-surface p-4 lg:p-6",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Logo variant="mark" href={null} />
          <span className="text-body-sm font-semibold text-ink">{SAMPLE.title}</span>
        </div>
        <span className="shrink-0 rounded-full border border-input px-2 py-1 text-caption font-semibold text-ink">
          {SAMPLE.sampleTag}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-soft">
          <UserRound className="size-6 text-ink" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-h4 font-semibold text-ink">{SAMPLE.name}</p>
          <p className="text-caption text-ink-muted">{SAMPLE.note}</p>
        </div>
      </div>

      <Separator className="my-4" />

      <ul className="flex flex-col gap-3">
        {SAMPLE.rows.map(({ icon: Icon, label, detail }) => (
          <li key={label} className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 gap-2">
              <Icon className="size-5 shrink-0 text-ink" aria-hidden />
              <div className="min-w-0">
                <span className="text-body-sm font-semibold text-ink">{label}</span>
                {variant === "detailed" && (
                  <span className="block text-caption text-ink-muted">{detail}</span>
                )}
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-caption font-semibold text-ink">
              <BadgeCheck className="size-4" aria-hidden />
              {VERIFICATION_STATUS_LABELS.verified}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

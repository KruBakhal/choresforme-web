import Image from "next/image";
import { IdCard as IdCardIcon, ShieldCheck, Smartphone } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { Separator } from "@/components/ui/separator";
import { VerificationBadge } from "@/components/worker/verification-badge";
import { JOB_BUILDER_COPY, WORKER_ONBOARDING_COPY } from "@/lib/constants";
import type { VerificationStatus } from "@/lib/types";

type IdCardProps = {
  /** "First L." */
  name: string;
  initials: string;
  /** A local preview (object URL); initials show without it. */
  photoUrl?: string;
  phoneStatus: VerificationStatus;
  idStatus: VerificationStatus;
  insuranceStatus: VerificationStatus;
  /** "Add a profile photo to complete your ID-Card" while there is no photo. */
  showPhotoNote?: boolean;
  titleId: string;
};

const BADGES = JOB_BUILDER_COPY.match.badges;

/**
 * The worker's Chores ID-Card from real data (T9; T10 Account): name, photo
 * or initials, and the Phone, ID and Insurance statuses. The T4 marketing
 * `IdCardPreview` is a separate, illustrative sample.
 */
export function IdCard({
  name,
  initials,
  photoUrl,
  phoneStatus,
  idStatus,
  insuranceStatus,
  showPhotoNote = false,
  titleId,
}: IdCardProps) {
  const rows = [
    { key: "phone", label: BADGES.phone, icon: Smartphone, status: phoneStatus },
    { key: "id", label: BADGES.id, icon: IdCardIcon, status: idStatus },
    { key: "insurance", label: BADGES.insurance, icon: ShieldCheck, status: insuranceStatus },
  ] as const;

  return (
    <figure
      aria-labelledby={titleId}
      className="w-full min-w-0 rounded-lg border border-border bg-surface p-4"
    >
      <div className="flex items-center gap-2">
        <Logo variant="mark" href={null} />
        <p id={titleId} className="text-body-sm font-semibold text-ink">
          {WORKER_ONBOARDING_COPY.idCard.title}
        </p>
      </div>
      <div className="mt-4 flex items-center gap-4">
        {photoUrl ? (
          <span className="relative size-14 shrink-0 overflow-hidden rounded-full bg-surface-alt">
            <Image src={photoUrl} alt="" fill unoptimized sizes="56px" className="object-cover" />
          </span>
        ) : (
          <span
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-soft text-h4 font-semibold text-ink"
          >
            {initials}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-h4 font-semibold break-words text-ink">{name}</p>
          {!photoUrl && showPhotoNote && (
            <p className="text-caption text-ink-muted">
              {WORKER_ONBOARDING_COPY.idCard.photoNeeded}
            </p>
          )}
        </div>
      </div>
      <Separator className="my-4" />
      <ul className="flex flex-col gap-3">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <li
              key={row.key}
              className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"
            >
              <span className="flex min-w-0 items-center gap-2">
                <Icon className="size-5 shrink-0 text-ink" aria-hidden />
                <span className="text-body-sm font-semibold text-ink">{row.label}</span>
              </span>
              <VerificationBadge status={row.status} />
            </li>
          );
        })}
      </ul>
    </figure>
  );
}

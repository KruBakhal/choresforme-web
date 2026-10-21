import type { CSSProperties } from "react";
import { MapPin } from "lucide-react";

import { WORKER_ONBOARDING_COPY } from "@/lib/constants";
import type { Address } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ringSize } from "@/lib/worker-onboarding";

type AreaMapPlaceholderProps = {
  /** Only when the address passes `addressSchema`. */
  address?: Address;
  radiusMiles: number;
};

const COPY = WORKER_ONBOARDING_COPY.area;
const CAPTION_ID = "area-map-caption";

const formatAddress = (address: Address) =>
  `${address.line1}, ${address.city}, ${address.state} ${address.zip}`;

/**
 * "Static map image placeholder" (Tech Spec; T9 decision 1): a token-styled
 * panel, not an image or map SDK. A ring around the pin grows with the
 * radius (illustrative, not to scale); the caption names the area.
 */
export function AreaMapPlaceholder({ address, radiusMiles }: AreaMapPlaceholderProps) {
  // The one data-driven inline style in T9 (UI plan open question 6).
  const ringStyle = { "--ring-size": ringSize(radiusMiles) } as CSSProperties;

  return (
    <figure
      aria-labelledby={CAPTION_ID}
      className="overflow-hidden rounded-lg border border-border"
    >
      <div aria-hidden className="relative h-60 overflow-hidden bg-surface-alt">
        <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
        <span className="absolute inset-y-0 left-1/2 w-px bg-border" />
        <span
          style={ringStyle}
          className="absolute top-1/2 left-1/2 aspect-square h-(--ring-size) -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-ink-muted bg-brand-soft/60 transition-all duration-150 motion-reduce:transition-none"
        />
        <span
          className={cn(
            "absolute top-1/2 left-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full",
            address ? "bg-brand" : "border-2 border-dashed border-input bg-surface",
          )}
        >
          <MapPin className={cn("size-5", address ? "text-brand-foreground" : "text-ink-muted")} />
        </span>
        <span className="absolute top-3 left-3 rounded-full bg-surface px-3 py-1 text-caption text-ink">
          {COPY.mapChip}
        </span>
      </div>
      <figcaption id={CAPTION_ID} className="border-t border-border bg-surface px-4 py-3">
        {address ? (
          <>
            <p className="text-body font-semibold text-ink">{COPY.mapWithin(radiusMiles)}</p>
            <p className="text-body-sm break-words text-ink-muted">
              {COPY.mapOf(formatAddress(address))}
            </p>
          </>
        ) : (
          <>
            <p className="text-body font-semibold text-ink">{COPY.mapPrompt}</p>
            <p className="text-body-sm text-ink-muted">{COPY.mapRadius(radiusMiles)}</p>
          </>
        )}
      </figcaption>
    </figure>
  );
}

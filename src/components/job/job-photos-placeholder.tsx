import { ImageOff } from "lucide-react";

import { DASHBOARD_COPY } from "@/lib/constants";

const COPY = DASHBOARD_COPY.detail;

/**
 * Photos on a posted job (T8 decision 6): one neutral tile per stored photo.
 * The stored object URLs were revoked when the draft was cleared, so no
 * `<img>` is ever rendered for them.
 */
export function JobPhotosPlaceholder({ count }: { count: number }) {
  return (
    <section
      aria-labelledby="job-photos-title"
      className="rounded-lg border border-border bg-surface p-4 md:p-6"
    >
      <h2 id="job-photos-title" className="text-h4 font-semibold text-ink">
        {COPY.photosTitle}
      </h2>
      {count > 0 ? (
        <>
          <ul
            aria-label={COPY.photosLabel}
            className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-3 xl:grid-cols-5"
          >
            {Array.from({ length: count }, (_, i) => (
              <li
                key={i}
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-md border border-border bg-surface-alt p-2 text-center"
              >
                <ImageOff className="size-6 text-ink-muted" aria-hidden />
                <span className="text-caption text-ink-muted">{COPY.photoTile(i + 1, count)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-body-sm text-ink-muted">{COPY.photosNote}</p>
        </>
      ) : (
        <p className="mt-2 text-body-sm text-ink-muted">{COPY.noPhotos}</p>
      )}
    </section>
  );
}

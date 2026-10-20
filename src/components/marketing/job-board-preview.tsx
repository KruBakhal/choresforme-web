import { CATEGORIES, CATEGORY_ICONS, JOB_BOARD_PREVIEW_COPY } from "@/lib/constants";

/** Decorative "open jobs" list for the worker visuals. No prices, distances or counts. */
export function JobBoardPreview() {
  return (
    <div aria-hidden="true" className="flex w-full min-w-0 flex-col gap-3">
      <p className="text-body-sm font-semibold text-ink">{JOB_BOARD_PREVIEW_COPY.title}</p>
      {CATEGORIES.slice(0, 3).map((category) => {
        const Icon = CATEGORY_ICONS[category.id];
        return (
          <div
            key={category.id}
            className="flex items-center gap-3 rounded-md border border-border bg-surface p-3"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-soft">
              <Icon className="size-5 text-ink" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-body-sm font-semibold text-ink">{category.name}</p>
              <p className="truncate text-caption text-ink-muted">{category.subServices[0]}</p>
            </div>
            <span className="ml-auto h-4 w-12 shrink-0 rounded-full bg-border" />
          </div>
        );
      })}
    </div>
  );
}

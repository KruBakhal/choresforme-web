"use client";

import { JsonBlock } from "@/app/dev/mock/_components/json-block";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DEV_MOCK_COPY, STATE_COPY } from "@/lib/constants";

type StoreBlockProps = {
  title: string;
  value: unknown;
  isEmpty: boolean;
  /** False until the store has loaded from localStorage (client only). */
  hydrated: boolean;
  onClear: () => void;
};

const S = DEV_MOCK_COPY.stores;

/** One persisted store: its name, a Clear action and its live value. */
export function StoreBlock({ title, value, isEmpty, hydrated, onClear }: StoreBlockProps) {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-3">
        <h3 className="min-w-0 text-body font-semibold break-words text-ink">
          {title}
          {hydrated && isEmpty && (
            <span className="ml-2 text-caption font-normal text-ink-muted">{S.empty}</span>
          )}
        </h3>
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>
          {S.clear}
          <span className="sr-only"> {title}</span>
        </Button>
      </div>
      <div className="mt-3">
        {hydrated ? (
          <JsonBlock value={value} label={title} className="max-h-60" />
        ) : (
          <div role="status">
            <span className="sr-only">{STATE_COPY.loading}</span>
            <Skeleton className="h-24 w-full" aria-hidden />
          </div>
        )}
      </div>
    </div>
  );
}

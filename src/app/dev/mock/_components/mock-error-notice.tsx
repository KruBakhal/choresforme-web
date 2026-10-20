import { Info } from "lucide-react";

import { DEV_MOCK_COPY } from "@/lib/constants";

/** Shown while the URL has `?mockError=1`. */
export function MockErrorNotice() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-input bg-brand-soft p-4 text-body-sm text-ink">
      <Info className="size-5 shrink-0" aria-hidden />
      <p>{DEV_MOCK_COPY.armedNotice}</p>
    </div>
  );
}

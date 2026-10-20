"use client";

import * as React from "react";

import { StoreBlock } from "@/app/dev/mock/_components/store-block";
import { Separator } from "@/components/ui/separator";
import { DEV_MOCK_COPY } from "@/lib/constants";
import {
  isJobDraftEmpty,
  useJobDraftStore,
  useOnboardingStore,
  useSessionStore,
  useStoresHydrated,
} from "@/lib/store";

const S = DEV_MOCK_COPY.stores;

/** Live values of the three persisted stores, each with a Clear action. */
export function StoreViewer() {
  const hydrated = useStoresHydrated();
  const session = useSessionStore((state) => state.session);
  const clearSession = useSessionStore((state) => state.clear);
  const draft = useJobDraftStore((state) => state.draft);
  const clearDraft = useJobDraftStore((state) => state.clear);
  const onboarding = useOnboardingStore((state) => state.byUser);
  const clearOnboarding = useOnboardingStore((state) => state.clear);

  const blocks = [
    { key: "session", title: S.session, value: session, isEmpty: !session, onClear: clearSession },
    {
      key: "draft",
      title: S.draft,
      value: draft,
      isEmpty: isJobDraftEmpty(draft),
      onClear: clearDraft,
    },
    {
      key: "onboarding",
      title: S.onboarding,
      value: onboarding,
      isEmpty: Object.keys(onboarding).length === 0,
      onClear: clearOnboarding,
    },
  ];

  return (
    <section
      aria-labelledby="stores"
      className="rounded-lg border border-border bg-surface p-4 md:p-6"
    >
      <h2 id="stores" className="scroll-mt-8 text-h3">
        {S.title}
      </h2>
      <p className="mt-1 text-body-sm text-ink-muted">{S.intro}</p>
      <div className="mt-6 flex flex-col gap-6">
        {blocks.map((block, index) => (
          <React.Fragment key={block.key}>
            {index > 0 && <Separator />}
            <StoreBlock
              title={block.title}
              value={block.value}
              isEmpty={block.isEmpty}
              hydrated={hydrated}
              onClear={block.onClear}
            />
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

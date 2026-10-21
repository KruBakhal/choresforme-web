"use client";

import * as React from "react";

import {
  FavouriteWorkersSection,
  type FavouritesState,
} from "@/components/dashboard/favourite-workers-section";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  PaymentMethodsSection,
  type MethodsState,
} from "@/components/dashboard/payment-methods-section";
import { ProfileSection } from "@/components/dashboard/profile-section";
import { SupportSection } from "@/components/dashboard/support-section";
import { TemplateList, type TemplatesState } from "@/components/dashboard/template-list";
import { usePageTitleFocus } from "@/components/dashboard/use-page-title-focus";
import { useRepost } from "@/components/dashboard/use-repost";
import { DASHBOARD_COPY } from "@/lib/constants";
import { useRevisitKey } from "@/lib/hooks/use-revisit-key";
import { favourites as favouriteService, payments, templates } from "@/lib/mock/services";
import { selectSessionUser, useSessionStore } from "@/lib/store";

const COPY = DASHBOARD_COPY.account;

/** `/dashboard/account`. Keyed per visit (`useRevisitKey`). */
export function AccountView() {
  const revisitKey = useRevisitKey();
  return <AccountSections key={revisitKey} />;
}

/**
 * Profile, Payment details, Favourite Workers, Saved Templates and Support
 * (T8 decision 7). Sections load independently (rule 32): one failing
 * section shows its own error and Retry. Calls run in this order, so
 * `?mockError=1` lands on `payments.listMethods`.
 */
function AccountSections() {
  const user = useSessionStore(selectSessionUser);
  const userId = user?.id ?? null;
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const [methods, setMethods] = React.useState<MethodsState>({ status: "loading" });
  const [favourites, setFavourites] = React.useState<FavouritesState>({ status: "loading" });
  const [templateState, setTemplateState] = React.useState<TemplatesState>({ status: "loading" });
  const { repost, openingId, dialog } = useRepost();
  const startedOnMount = React.useRef(false);

  usePageTitleFocus(titleRef, true);

  const loadMethods = React.useCallback(async () => {
    if (!userId) return;
    try {
      setMethods({ status: "ready", methods: await payments.listMethods(userId) });
    } catch {
      setMethods({ status: "error", retrying: false });
    }
  }, [userId]);

  const loadFavourites = React.useCallback(async () => {
    if (!userId) return;
    try {
      setFavourites({ status: "ready", workers: await favouriteService.list(userId) });
    } catch {
      setFavourites({ status: "error", retrying: false });
    }
  }, [userId]);

  const loadTemplates = React.useCallback(async () => {
    if (!userId) return;
    try {
      setTemplateState({ status: "ready", templates: await templates.list(userId) });
    } catch {
      setTemplateState({ status: "error", retrying: false });
    }
  }, [userId]);

  React.useEffect(() => {
    // Once per mount (Strict Mode runs effects twice; a second request would hide a ?mockError=1 failure).
    if (startedOnMount.current) return;
    startedOnMount.current = true;
    void loadMethods();
    void loadFavourites();
    void loadTemplates();
  }, [loadMethods, loadFavourites, loadTemplates]);

  if (!user || !userId) return null;

  return (
    <div>
      <PageHeader titleRef={titleRef} title={COPY.title} description={COPY.description} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start xl:gap-8">
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-7">
          <ProfileSection user={user} />
          <PaymentMethodsSection
            userId={userId}
            state={methods}
            onRetry={() => {
              setMethods({ status: "error", retrying: true });
              void loadMethods();
            }}
            onAdded={(method) =>
              setMethods((current) =>
                current.status === "ready"
                  ? { status: "ready", methods: [...current.methods, method] }
                  : { status: "ready", methods: [method] },
              )
            }
          />
        </div>
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-5">
          <FavouriteWorkersSection
            userId={userId}
            state={favourites}
            onRetry={() => {
              setFavourites({ status: "error", retrying: true });
              void loadFavourites();
            }}
            onRemoved={(workerId) =>
              setFavourites((current) =>
                current.status === "ready"
                  ? {
                      status: "ready",
                      workers: current.workers.filter((worker) => worker.id !== workerId),
                    }
                  : current,
              )
            }
          />
          <TemplateList
            variant="section"
            titleId="account-templates-title"
            state={templateState}
            repostingId={openingId}
            onRepost={(template) => repost({ kind: "template", template })}
            onRetry={() => {
              setTemplateState({ status: "error", retrying: true });
              void loadTemplates();
            }}
          />
          <SupportSection />
        </div>
      </div>
      {dialog}
    </div>
  );
}

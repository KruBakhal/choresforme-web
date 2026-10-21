"use client";

import * as React from "react";
import { Mail, Smartphone, X } from "lucide-react";

import { ExternalLink } from "@/components/marketing/external-link";
import { Button } from "@/components/ui/button";
import { dismissAppPrompt, type PromptApp } from "@/lib/app-prompt";
import { APP_PROMPT_COPY, PLAY_STORE_CUSTOMER_URL, PLAY_STORE_WORKER_URL } from "@/lib/constants";
import { useAppPromptState, type AppPromptVariant } from "@/lib/hooks/use-app-prompt";
import { cn } from "@/lib/utils";

type AppPromptProps = {
  app: PromptApp;
  /** Android title, e.g. "Get notified the moment a worker accepts — install the app". */
  androidTitle: string;
  androidBody?: string;
  /** The Play Store button label. */
  installLabel: string;
  /** Every other device: "We'll email and text you updates". */
  updatesText: string;
  headingLevel?: 2 | 3;
  /**
   * `rail` (T8 Home): in the 272 px rail column from 1280 px the disc sits on
   * its own line and the title runs full width below it. Below 1280 px it is
   * the row layout.
   */
  layout?: "row" | "rail";
  /** `app_prompt_shown` trigger point (T11): the first visible render. */
  onShown?: (variant: AppPromptVariant) => void;
  /** `app_prompt_clicked` trigger point (T11): the Play Store button. */
  onInstallClick?: () => void;
  /** After Dismiss: the caller moves focus (it never drops to `body`). */
  onDismissed?: () => void;
};

const PLAY_STORE_URLS: Record<PromptApp, string> = {
  customer: PLAY_STORE_CUSTOMER_URL,
  worker: PLAY_STORE_WORKER_URL,
};

/**
 * App hand-off prompt (T7; T11 reuses it on the worker dashboard). Android
 * gets the install message and a Play Store button; every other device gets
 * "We'll email and text you updates", never a dead link. Nothing renders
 * before mount or while a dismissal (7 days, per app) is active. It never
 * blocks a web action.
 */
export function AppPrompt({
  app,
  androidTitle,
  androidBody,
  installLabel,
  updatesText,
  headingLevel = 2,
  layout = "row",
  onShown,
  onInstallClick,
  onDismissed,
}: AppPromptProps) {
  const state = useAppPromptState(app);
  const [dismissedNow, setDismissedNow] = React.useState(false);
  const visibleVariant = state.status === "visible" && !dismissedNow ? state.variant : null;

  const shownRef = React.useRef(false);
  React.useEffect(() => {
    if (!visibleVariant || shownRef.current) return;
    shownRef.current = true;
    onShown?.(visibleVariant);
  }, [visibleVariant, onShown]);

  if (!visibleVariant) return null;

  const Heading = headingLevel === 3 ? "h3" : "h2";
  const titleId = `app-prompt-${app}-title`;
  const android = visibleVariant === "android";
  const Icon = android ? Smartphone : Mail;

  function dismiss() {
    dismissAppPrompt(app);
    setDismissedNow(true);
    onDismissed?.();
  }

  return (
    <section
      aria-labelledby={titleId}
      className="relative rounded-lg border border-border bg-surface p-4 md:p-6"
    >
      <div
        className={cn("flex items-start gap-4 pr-12", layout === "rail" && "xl:flex-col xl:pr-0")}
      >
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand md:size-12"
        >
          <Icon className="size-5 text-brand-foreground md:size-6" />
        </span>
        {android ? (
          <div className={cn("min-w-0 flex-1", layout === "rail" && "xl:w-full")}>
            <Heading id={titleId} className="text-h4 font-semibold text-ink">
              {androidTitle}
            </Heading>
            {androidBody && <p className="mt-1 text-body-sm text-ink-muted">{androidBody}</p>}
            <Button asChild className="mt-4 w-full sm:w-auto">
              <ExternalLink href={PLAY_STORE_URLS[app]} onClick={onInstallClick}>
                {installLabel}
              </ExternalLink>
            </Button>
          </div>
        ) : (
          <Heading
            id={titleId}
            className={cn(
              "min-w-0 flex-1 self-center text-h4 font-semibold text-ink",
              layout === "rail" && "xl:w-full xl:self-start",
            )}
          >
            {updatesText}
          </Heading>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={APP_PROMPT_COPY.dismiss}
        onClick={dismiss}
        className="absolute top-2 right-2 md:top-4 md:right-4"
      >
        <X className="size-5" aria-hidden />
      </Button>
    </section>
  );
}

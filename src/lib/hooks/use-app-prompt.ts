"use client";

import * as React from "react";

import { isAppPromptDismissed, type PromptApp } from "@/lib/app-prompt";
import { isAndroidUserAgent } from "@/lib/device";

/** `android`: Play Store button; `updates`: "We'll email and text you updates". */
export type AppPromptVariant = "android" | "updates";

export type AppPromptState =
  /** Before mount (server render and hydration): render nothing. */
  | { status: "pending" }
  /** Dismissed within the last 7 days. */
  | { status: "dismissed" }
  | { status: "visible"; variant: AppPromptVariant };

const noSubscribe = () => () => {};
const serverSnapshot = () => null;

const readVariant = (): AppPromptVariant =>
  isAndroidUserAgent(window.navigator.userAgent) ? "android" : "updates";

/**
 * The app prompt's device variant and saved dismissal (T7, reused by T11).
 * Read on the client only: the server render and the hydration render both
 * see `pending`, so nothing mismatches and the wrong variant never flashes.
 * A dismissal made in this view is the caller's state (storage does not
 * notify).
 */
export function useAppPromptState(app: PromptApp): AppPromptState {
  const variant = React.useSyncExternalStore(noSubscribe, readVariant, serverSnapshot);
  const dismissed = React.useSyncExternalStore(
    noSubscribe,
    () => isAppPromptDismissed(app),
    serverSnapshot,
  );

  if (variant === null || dismissed === null) return { status: "pending" };
  if (dismissed) return { status: "dismissed" };
  return { status: "visible", variant };
}

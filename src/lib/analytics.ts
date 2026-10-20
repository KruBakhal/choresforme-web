import type { Role } from "@/lib/types";

/*
 * Funnel analytics stub (PRD "Funnel analytics"). `track()` only logs to the
 * console; it sends nothing. T11 wires the events, fills source, device and
 * role, and can swap this for GA4 or PostHog.
 */

/** Event names, verbatim from the PRD, in funnel order. */
export const ANALYTICS_EVENTS = {
  customer: [
    "landing_view",
    "job_builder_start",
    "category_selected",
    "services_selected",
    "address_entered",
    "details_entered",
    "match_choice",
    "signup_started",
    "signup_completed",
    "payment_added",
    "job_posted",
  ],
  worker: [
    "worker_page_view",
    "worker_signup_started",
    "worker_signup_completed",
    "area_set",
    "services_set",
    "board_viewed",
    "id_uploaded",
    "insurance_uploaded",
    "payout_added",
    "worker_verified",
    "first_job_accepted",
  ],
  handOff: ["app_prompt_shown", "app_prompt_clicked", "app_first_login"],
} as const;

export type CustomerEvent = (typeof ANALYTICS_EVENTS.customer)[number];
export type WorkerEvent = (typeof ANALYTICS_EVENTS.worker)[number];
export type HandOffEvent = (typeof ANALYTICS_EVENTS.handOff)[number];
export type AnalyticsEvent = CustomerEvent | WorkerEvent | HandOffEvent;

export type TrafficSource = "search" | "ad" | "referral" | "direct";
export type DeviceType = "desktop" | "tablet" | "mobile";

/** "Each event carries source (search, ad, referral, direct), device type and role." */
export type AnalyticsProps = {
  role?: Role;
  device?: DeviceType;
  source?: TrafficSource;
  [key: string]: string | number | boolean | null | undefined;
};

/** Logs a funnel event to the console as `[analytics] event_name {…}`. */
export function track(eventName: AnalyticsEvent, props: AnalyticsProps = {}): void {
  console.info(`[analytics] ${eventName}`, props);
}

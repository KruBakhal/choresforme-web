/*
 * Device detection for the app hand-off (T7, reused by T11). Pure: callers
 * pass `navigator.userAgent`, read on the client after mount, so the server
 * render and the hydration render never differ.
 */

/** True for Android phones and tablets (PRD App hand-off: Play Store button). */
export function isAndroidUserAgent(userAgent: string | null | undefined): boolean {
  return /Android/i.test(userAgent ?? "");
}

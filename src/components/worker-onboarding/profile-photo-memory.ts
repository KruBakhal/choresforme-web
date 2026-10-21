"use client";

import * as React from "react";

import { filePreviewUrl, releaseFilePreview } from "@/components/forms/document-upload-field";

/*
 * The optional profile photo chosen on Verify ID (T9 open question 5): kept
 * in memory for this tab only, per worker, never uploaded or saved. The
 * ID-Card shows it on every step until a reload, then falls back to initials.
 */

const photos = new Map<string, File>();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function rememberedProfilePhoto(userId: string): File | null {
  return photos.get(userId) ?? null;
}

/** Sets or clears the photo; the previous file's preview URL is revoked. */
export function rememberProfilePhoto(userId: string, file: File | null): void {
  const previous = photos.get(userId);
  if (previous === file) return;
  if (previous) releaseFilePreview(previous);
  if (file) photos.set(userId, file);
  else photos.delete(userId);
  emit();
}

const noPhoto = () => null;

/** The photo's preview URL for the ID-Card (null on the server, before a pick and after a reload). */
export function useProfilePhotoUrl(userId: string): string | null {
  const getSnapshot = React.useCallback(() => filePreviewUrl(photos.get(userId) ?? null), [userId]);
  return React.useSyncExternalStore(subscribe, getSnapshot, noPhoto);
}

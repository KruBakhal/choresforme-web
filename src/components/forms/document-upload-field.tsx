"use client";

import * as React from "react";
import Image from "next/image";
import {
  Camera,
  CircleAlert,
  CircleCheck,
  FileText,
  ImageIcon,
  RotateCw,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react";

import { FieldError } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { WORKER_ONBOARDING_COPY } from "@/lib/constants";
import { cn } from "@/lib/utils";

/*
 * Local previews (UI only; nothing is uploaded). One object URL per File for
 * the tab's lifetime, so a remounted field or the ID-Card reuses it; it is
 * revoked when the file is removed or replaced.
 */
const previewUrls = new WeakMap<File, string>();

const PREVIEWABLE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function isPreviewableImage(file: File): boolean {
  return PREVIEWABLE_TYPES.includes(file.type);
}

/** The object URL for a JPG, PNG or WebP file (null for HEIC and PDF, which browsers may not show). */
export function filePreviewUrl(file: File | null | undefined): string | null {
  if (!file || !isPreviewableImage(file) || typeof URL === "undefined") return null;
  let url = previewUrls.get(file);
  if (!url) {
    url = URL.createObjectURL(file);
    previewUrls.set(file, url);
  }
  return url;
}

/** Revokes a file's preview URL (call when the file is removed or replaced). */
export function releaseFilePreview(file: File | null | undefined): void {
  if (!file) return;
  const url = previewUrls.get(file);
  if (url) URL.revokeObjectURL(url);
  previewUrls.delete(file);
}

export type UploadState = "idle" | "uploading" | "failed" | "done";

type FileCheck = {
  safeParse: (value: unknown) => {
    success: boolean;
    error?: { issues: readonly { message: string }[] };
  };
};

type DocumentUploadFieldProps = {
  id: string;
  label: string;
  hint: string;
  prompt: string;
  icon: LucideIcon;
  accept: readonly string[];
  /** Pick-time check; a refused file is not taken. */
  fileSchema: FileCheck;
  /** Offer "Take photo" (camera capture) on touch devices. */
  allowCamera?: boolean;
  value: File | null;
  onChange: (file: File | null) => void;
  /** Submit validation message. */
  error?: string;
  /** The upload row. Omitted: local mode (preview only, never uploaded). */
  upload?: { state: UploadState; progress: number; onRetry: () => void };
  /** While the step uploads. */
  disabled?: boolean;
  /** The "Choose file" button (the form's focus target). */
  ref?: React.Ref<HTMLButtonElement>;
  /** The "Retry" button, so the step can focus the first failed row. */
  retryRef?: React.Ref<HTMLButtonElement>;
};

const COPY = WORKER_ONBOARDING_COPY.upload;

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.RefObject<T | null>).current = value;
}

/**
 * One document (T9): choose a file or take a photo, a local preview, remove,
 * then an upload row with a progress bar, "Upload failed" + Retry, or
 * "Uploaded". Holds a `File`; the step owns the upload state and the calls.
 */
export function DocumentUploadField({
  id,
  label,
  hint,
  prompt,
  icon: Icon,
  accept,
  fileSchema,
  allowCamera = true,
  value,
  onChange,
  error,
  upload,
  disabled = false,
  ref,
  retryRef,
}: DocumentUploadFieldProps) {
  const [pickError, setPickError] = React.useState<string | null>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);
  const cameraInput = React.useRef<HTMLInputElement>(null);
  const chooseButton = React.useRef<HTMLButtonElement | null>(null);
  const focusChooseAfterRemove = React.useRef(false);

  const ids = {
    label: `${id}-label`,
    hint: `${id}-hint`,
    error: `${id}-error`,
    pickError: `${id}-pick-error`,
    status: `${id}-status`,
  };

  React.useEffect(() => {
    if (value === null && focusChooseAfterRemove.current) {
      focusChooseAfterRemove.current = false;
      chooseButton.current?.focus();
    }
  }, [value]);

  const chooseRef = React.useCallback(
    (element: HTMLButtonElement | null) => {
      chooseButton.current = element;
      setRef(ref, element);
    },
    [ref],
  );

  function pick(input: HTMLInputElement) {
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    const check = fileSchema.safeParse(file);
    if (!check.success) {
      setPickError(check.error?.issues[0]?.message ?? COPY.failed);
      return;
    }
    setPickError(null);
    if (value && value !== file) releaseFilePreview(value);
    onChange(file);
  }

  function remove() {
    releaseFilePreview(value);
    setPickError(null);
    focusChooseAfterRemove.current = true;
    onChange(null);
  }

  const describedBy = [ids.hint, error ? ids.error : null, pickError ? ids.pickError : null]
    .filter(Boolean)
    .join(" ");

  const state = upload?.state ?? "idle";
  const canRemove = !disabled && (!upload || state === "idle" || state === "failed");
  const previewUrl = filePreviewUrl(value);
  const isPdf = value?.type === "application/pdf";

  return (
    <div role="group" aria-labelledby={ids.label} aria-describedby={describedBy}>
      <p id={ids.label} className="text-body-sm font-semibold text-ink">
        {label}
      </p>
      <p id={ids.hint} className="mt-1 text-body-sm text-ink-muted">
        {hint}
      </p>

      <input
        ref={fileInput}
        type="file"
        accept={accept.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => pick(event.currentTarget)}
      />
      {allowCamera && (
        <input
          ref={cameraInput}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(event) => pick(event.currentTarget)}
        />
      )}

      {!value ? (
        <div
          className={cn(
            "mt-3 flex flex-col items-center gap-4 rounded-lg border-2 border-dashed bg-surface p-6 text-center",
            error ? "border-danger" : "border-input",
          )}
        >
          <Icon className="size-6 text-ink-muted" aria-hidden />
          <p className="text-body-sm text-ink-muted">{prompt}</p>
          <div className="flex w-full flex-col gap-3">
            <Button
              ref={chooseRef}
              type="button"
              variant="outline"
              disabled={disabled}
              aria-describedby={error ? ids.error : undefined}
              aria-invalid={error ? true : undefined}
              onClick={() => fileInput.current?.click()}
            >
              <Upload aria-hidden />
              {COPY.chooseFile}
              <span className="sr-only">{COPY.chooseSr(label)}</span>
            </Button>
            {allowCamera && (
              <Button
                type="button"
                variant="outline"
                disabled={disabled}
                className="hidden pointer-coarse:inline-flex"
                onClick={() => cameraInput.current?.click()}
              >
                <Camera aria-hidden />
                {COPY.takePhoto}
                <span className="sr-only">{COPY.takePhotoSr(label)}</span>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
          <div className="flex items-start gap-3">
            <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-surface-alt">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt={COPY.alt(label, value.name)}
                  fill
                  unoptimized
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <span className="flex size-full flex-col items-center justify-center gap-1">
                  {isPdf ? (
                    <FileText className="size-5 text-ink-muted" aria-hidden />
                  ) : (
                    <ImageIcon className="size-5 text-ink-muted" aria-hidden />
                  )}
                  <span className="text-caption font-semibold text-ink">
                    {isPdf ? COPY.pdf : COPY.heic}
                  </span>
                </span>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-body-sm font-semibold break-all text-ink">
                {value.name}
              </p>
              <p className="text-caption text-ink-muted">{COPY.size(value.size)}</p>
            </div>
            {canRemove && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={COPY.remove(label, value.name)}
                onClick={remove}
              >
                <X aria-hidden />
              </Button>
            )}
          </div>

          {upload && (
            <div className="flex flex-col gap-2">
              {state === "uploading" && (
                <Progress
                  value={upload.progress}
                  aria-labelledby={ids.label}
                  getValueLabel={(current) => COPY.percent(current)}
                />
              )}
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <div id={ids.status} role="status" className="text-body-sm">
                  {state === "idle" && <span className="text-ink-muted">{COPY.ready}</span>}
                  {state === "uploading" && <span className="text-ink">{COPY.uploading}</span>}
                  {state === "failed" && (
                    <span className="flex items-start gap-2 text-danger">
                      <CircleAlert className="size-4 shrink-0" aria-hidden />
                      {COPY.failed}
                    </span>
                  )}
                  {state === "done" && (
                    <span className="flex items-center gap-2 font-semibold text-ink">
                      <CircleCheck className="size-4 shrink-0 text-success" aria-hidden />
                      {COPY.uploaded}
                    </span>
                  )}
                </div>
                {state === "uploading" && (
                  <span aria-hidden className="text-body-sm text-ink-muted tabular-nums">
                    {COPY.percent(upload.progress)}
                  </span>
                )}
                {state === "failed" && (
                  <Button
                    ref={retryRef}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    aria-describedby={ids.status}
                    onClick={upload.onRetry}
                  >
                    <RotateCw aria-hidden />
                    {COPY.retry}
                    <span className="sr-only">{COPY.retrySr(label)}</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2">
          <FieldError id={ids.error} message={error} />
        </div>
      )}
      <div id={ids.pickError} role="alert" className="mt-2 flex flex-col gap-1 empty:hidden">
        {pickError && <FieldError id={`${ids.pickError}-message`} message={pickError} />}
      </div>
    </div>
  );
}

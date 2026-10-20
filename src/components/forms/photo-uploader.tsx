"use client";

import * as React from "react";
import Image from "next/image";
import { Camera, ImageIcon, ImagePlus, X } from "lucide-react";

import { FieldError } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { JOB_BUILDER_COPY, VALIDATION_MESSAGES } from "@/lib/constants";
import { revokePhotoUrls } from "@/lib/job-builder";
import { photoFileSchema } from "@/lib/validation";

/*
 * Photos are object URLs (UI only; nothing is uploaded). The draft holds just
 * the URLs, so the file name and type live here for the tab's lifetime.
 */
const photoMeta = new Map<string, { name: string; type: string }>();

const HEIC = /\.(heic|heif)$/i;

function describe(url: string, fallbackName: string) {
  const meta = photoMeta.get(url);
  const name = meta?.name ?? fallbackName;
  const previewable = !(
    meta?.type === "image/heic" ||
    meta?.type === "image/heif" ||
    HEIC.test(name)
  );
  return { name, previewable };
}

type PhotoUploaderProps = {
  id: string;
  label: string;
  hint: string;
  note?: string;
  /** Object URLs, in order. */
  value: string[];
  onChange: (urls: string[]) => void;
  max: number;
  accept: readonly string[];
  /** Offer "Take photo" (camera capture) on touch devices. */
  allowCamera?: boolean;
};

const COPY = JOB_BUILDER_COPY.details;

/**
 * Photo picker with previews (T6; reused by T9). "Choose photos" always opens
 * the file picker (several at once); "Take photo" opens the camera on touch
 * devices. Files over the limit, too large or of the wrong type are refused
 * with a message; remove revokes the object URL.
 */
export function PhotoUploader({
  id,
  label,
  hint,
  note,
  value,
  onChange,
  max,
  accept,
  allowCamera = true,
}: PhotoUploaderProps) {
  const [errors, setErrors] = React.useState<string[]>([]);
  const [status, setStatus] = React.useState("");
  const fileInput = React.useRef<HTMLInputElement>(null);
  const cameraInput = React.useRef<HTMLInputElement>(null);
  const chooseButton = React.useRef<HTMLButtonElement>(null);
  const removeButtons = React.useRef<(HTMLButtonElement | null)[]>([]);
  const pendingFocus = React.useRef<number | null>(null);

  const ids = {
    label: `${id}-label`,
    hint: `${id}-hint`,
    note: `${id}-note`,
    error: `${id}-error`,
    files: `${id}-input`,
    camera: `${id}-camera`,
  };

  React.useEffect(() => {
    const index = pendingFocus.current;
    if (index === null) return;
    pendingFocus.current = null;
    const target = removeButtons.current[Math.min(index, value.length - 1)];
    (target ?? chooseButton.current)?.focus();
  }, [value]);

  function addFiles(input: HTMLInputElement) {
    const files = Array.from(input.files ?? []);
    input.value = "";
    if (files.length === 0) return;

    const problems = new Set<string>();
    const added: string[] = [];
    let room = max - value.length;
    for (const file of files) {
      const check = photoFileSchema.safeParse(file);
      if (!check.success) {
        problems.add(check.error.issues[0]?.message ?? VALIDATION_MESSAGES.photoType);
        continue;
      }
      if (room <= 0) {
        problems.add(VALIDATION_MESSAGES.photosMax);
        continue;
      }
      const url = URL.createObjectURL(file);
      photoMeta.set(url, { name: file.name, type: file.type });
      added.push(url);
      room -= 1;
    }

    setErrors([...problems]);
    if (added.length > 0) {
      const next = [...value, ...added];
      onChange(next);
      setStatus(COPY.photoAdded(next.length, max));
    }
  }

  function remove(index: number) {
    const url = value[index];
    revokePhotoUrls([url]);
    photoMeta.delete(url);
    const next = value.filter((_, i) => i !== index);
    pendingFocus.current = index;
    setErrors([]);
    setStatus(COPY.photoRemoved(next.length, max));
    onChange(next);
  }

  const describedBy = [ids.hint, note ? ids.note : null, errors.length ? ids.error : null]
    .filter(Boolean)
    .join(" ");

  const actions = (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
      <Button
        ref={chooseButton}
        type="button"
        variant="outline"
        onClick={() => fileInput.current?.click()}
      >
        <ImagePlus aria-hidden />
        {COPY.choosePhotos}
      </Button>
      {allowCamera && (
        <Button
          type="button"
          variant="outline"
          className="hidden pointer-coarse:inline-flex"
          onClick={() => cameraInput.current?.click()}
        >
          <Camera aria-hidden />
          {COPY.takePhoto}
        </Button>
      )}
    </div>
  );

  return (
    <div role="group" aria-labelledby={ids.label} aria-describedby={describedBy}>
      <p id={ids.label} className="text-body-sm font-semibold text-ink">
        {label}
      </p>
      <p id={ids.hint} className="mt-2 text-body-sm text-ink-muted">
        {hint}
      </p>

      <input
        ref={fileInput}
        id={ids.files}
        type="file"
        multiple
        accept={accept.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => addFiles(event.currentTarget)}
      />
      {allowCamera && (
        <input
          ref={cameraInput}
          id={ids.camera}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(event) => addFiles(event.currentTarget)}
        />
      )}

      {value.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-input bg-surface p-6 text-center">
          <ImagePlus className="size-6 text-ink-muted" aria-hidden />
          <p className="text-body-sm text-ink-muted">{COPY.photosEmpty}</p>
          {actions}
        </div>
      ) : (
        <>
          <ul
            aria-label={COPY.addedPhotosLabel}
            className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5"
          >
            {value.map((url, index) => {
              const { name, previewable } = describe(url, COPY.photoFallbackName);
              return (
                <li
                  key={url}
                  className="relative aspect-square overflow-hidden rounded-md border border-border bg-surface-alt"
                >
                  {previewable ? (
                    <Image
                      src={url}
                      alt={COPY.photoAlt(index + 1, value.length, name)}
                      fill
                      unoptimized
                      sizes="160px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-2 p-3">
                      <ImageIcon className="size-6 text-ink-muted" aria-hidden />
                      <span className="line-clamp-2 text-caption break-all text-ink">{name}</span>
                    </div>
                  )}
                  <Button
                    ref={(element) => {
                      removeButtons.current[index] = element;
                    }}
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={COPY.removePhoto(index + 1, name)}
                    className="absolute top-1 right-1 rounded-full bg-surface"
                    onClick={() => remove(index)}
                  >
                    <X aria-hidden />
                  </Button>
                </li>
              );
            })}
          </ul>
          <div className="mt-4">{actions}</div>
          <p className="mt-2 text-body-sm text-ink-muted">{COPY.photoCount(value.length, max)}</p>
        </>
      )}

      {note && (
        <p id={ids.note} className="mt-2 text-body-sm text-ink-muted">
          {note}
        </p>
      )}
      <div id={ids.error} role="alert" className="mt-2 flex flex-col gap-1 empty:hidden">
        {errors.map((message, index) => (
          <FieldError key={message} id={`${ids.error}-${index}`} message={message} />
        ))}
      </div>
      <span className="sr-only" role="status">
        {status}
      </span>
    </div>
  );
}

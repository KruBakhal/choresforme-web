import * as React from "react";
import { CircleAlert } from "lucide-react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type FormFieldControlProps = {
  id: string;
  /** Space-separated ids of the hint and error that exist, or undefined. */
  describedBy: string | undefined;
  invalid: boolean;
};

type FormFieldProps = {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  /** Extra ids for `aria-describedby` (for example a status line). */
  describedByExtra?: string;
  /** Rendered after the error, inside the field wrapper (for example a link row). */
  after?: React.ReactNode;
  className?: string;
  children: (control: FormFieldControlProps) => React.ReactNode;
};

/** The error line under a control: a 16 px icon and the message. */
export function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} className="flex items-start gap-2 text-body-sm text-danger">
      <CircleAlert className="size-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </p>
  );
}

/**
 * Label, control, hint and error in one place (T5, reused by T6–T9). The
 * error sits under the control and is linked with `aria-describedby`; the
 * control gets `aria-invalid` only while an error shows.
 */
export function FormField({
  id,
  label,
  hint,
  error,
  describedByExtra,
  after,
  className,
  children,
}: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId, describedByExtra].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children({ id, describedBy, invalid: !!error })}
      {hint && (
        <p id={hintId} className="text-body-sm text-ink-muted">
          {hint}
        </p>
      )}
      {error && <FieldError id={`${id}-error`} message={error} />}
      {after}
    </div>
  );
}

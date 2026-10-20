"use client";

import * as React from "react";

import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { AUTH_COPY } from "@/lib/constants";
import type { Role } from "@/lib/types";

const noSubscribe = () => () => {};

function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Today as 'YYYY-MM-DD' on the client, undefined on the server and during
 * hydration (so the `max` attribute never causes a hydration mismatch).
 */
function useTodayIso(): string | undefined {
  return React.useSyncExternalStore(noSubscribe, todayIso, () => undefined);
}

type DobFieldProps = Omit<React.ComponentProps<typeof Input>, "id" | "type"> & {
  id?: string;
  role: Role;
  error?: string;
};

/** Date of birth (required for both roles; workers 18+, checked by the schema). */
export function DobField({ id = "dob", role, error, ...inputProps }: DobFieldProps) {
  const max = useTodayIso();

  return (
    <FormField
      id={id}
      label={AUTH_COPY.fields.dob}
      hint={role === "worker" ? AUTH_COPY.fields.dobHintWorker : undefined}
      error={error}
    >
      {({ describedBy, invalid }) => (
        <Input
          id={id}
          type="date"
          autoComplete="bday"
          max={max}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          aria-required="true"
          className="sm:max-w-xs"
          {...inputProps}
        />
      )}
    </FormField>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { CircleAlert, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Plain data for a form alert, so a form can hand its alert to the page. */
export type FormAlertData = {
  tone: "error" | "info";
  message: string;
  title?: string;
  /** A link, or (T7, inline auth on Review) a button that switches the form in place. */
  action?: { label: string; href: string } | { label: string; onClick: () => void };
};

let alertSeq = 0;

/** A fresh React key per alert, so a repeated alert remounts and takes focus again. Event time only. */
export function nextAlertKey(): number {
  alertSeq += 1;
  return alertSeq;
}

type FormAlertProps = {
  tone: FormAlertData["tone"];
  message: string;
  title?: string;
  /** Usually a `Button variant="link" size="sm"`. */
  action?: React.ReactNode;
  /** Focus the alert when it appears (also scrolls it into view). */
  autoFocus?: boolean;
  className?: string;
};

/**
 * The "Inline message above the form" from the Tech Spec screen states. The
 * icon and border carry the tone; the text stays ink.
 */
export function FormAlert({
  tone,
  message,
  title,
  action,
  autoFocus = true,
  className,
}: FormAlertProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  const Icon = tone === "error" ? CircleAlert : Info;

  return (
    <div
      ref={ref}
      role={tone === "error" ? "alert" : "status"}
      tabIndex={-1}
      className={cn(
        "flex gap-3 rounded-md border p-4 outline-none focus-visible:outline-2",
        tone === "error" ? "border-danger bg-surface" : "border-input bg-brand-soft",
        className,
      )}
    >
      <Icon
        className={cn("size-5 shrink-0", tone === "error" ? "text-danger" : "text-ink")}
        aria-hidden
      />
      <div className="flex min-w-0 flex-col gap-1">
        {title && <p className="text-body font-semibold text-ink">{title}</p>}
        <p className="text-body-sm text-ink">{message}</p>
        {action && <div className="mt-1">{action}</div>}
      </div>
    </div>
  );
}

/** Renders `FormAlertData`, with its action as a link button. */
export function FormAlertFromData({
  alert,
  autoFocus,
  className,
}: {
  alert: FormAlertData;
  autoFocus?: boolean;
  className?: string;
}) {
  return (
    <FormAlert
      tone={alert.tone}
      title={alert.title}
      message={alert.message}
      autoFocus={autoFocus}
      className={className}
      action={
        alert.action &&
        ("href" in alert.action ? (
          <Button asChild variant="link" size="sm">
            <Link href={alert.action.href}>{alert.action.label}</Link>
          </Button>
        ) : (
          <Button type="button" variant="link" size="sm" onClick={alert.action.onClick}>
            {alert.action.label}
          </Button>
        ))
      }
    />
  );
}

"use client";

import { FlaskConical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AUTH_COPY, DEMO_ACCOUNTS, DEMO_OTP_CODE } from "@/lib/constants";

export const DEMO_ACCOUNTS_ID = "demo-accounts";
export const DEMO_ACCOUNTS_TITLE_ID = "demo-accounts-title";

type DemoAccountsPanelProps = {
  /** Fills the login form with the account and submits it. */
  onSelect: (email: string) => void;
  pendingEmail: string | null;
  disabled: boolean;
};

/** "Demo accounts" on /login: one-click login, "any password" and the SMS code. */
export function DemoAccountsPanel({ onSelect, pendingEmail, disabled }: DemoAccountsPanelProps) {
  return (
    <section
      id={DEMO_ACCOUNTS_ID}
      aria-labelledby={DEMO_ACCOUNTS_TITLE_ID}
      className="scroll-mt-4 rounded-lg border border-border bg-surface p-4 md:p-6"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-soft">
          <FlaskConical className="size-5 text-ink" aria-hidden />
        </span>
        <h2
          id={DEMO_ACCOUNTS_TITLE_ID}
          tabIndex={-1}
          className="text-h4 outline-none focus-visible:outline-2"
        >
          {AUTH_COPY.demo.title}
        </h2>
      </div>
      <p className="mt-2 text-body-sm text-ink-muted">{AUTH_COPY.demo.description}</p>

      <ul className="mt-4 divide-y divide-border">
        {DEMO_ACCOUNTS.map((account) => {
          const pending = pendingEmail === account.email;
          return (
            <li
              key={account.email}
              className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-body font-semibold text-ink">{account.label}</p>
                <p className="text-body-sm break-all text-ink-muted">{account.email}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                aria-label={pending ? undefined : AUTH_COPY.demo.logInAs(account.label)}
                loading={pending}
                disabled={disabled && !pending}
                onClick={() => onSelect(account.email)}
              >
                {pending ? AUTH_COPY.demo.loggingIn : AUTH_COPY.demo.logIn}
              </Button>
            </li>
          );
        })}
      </ul>

      <dl className="mt-4 flex flex-wrap gap-2">
        <div className="flex gap-1 rounded-full bg-surface-alt px-3 py-1 text-body-sm text-ink">
          <dt className="font-semibold">{AUTH_COPY.demo.passwordLabel}</dt>
          <dd>{AUTH_COPY.demo.passwordValue}</dd>
        </div>
        <div className="flex gap-1 rounded-full bg-surface-alt px-3 py-1 text-body-sm text-ink">
          <dt className="font-semibold">{AUTH_COPY.demo.otpLabel}</dt>
          <dd>{DEMO_OTP_CODE}</dd>
        </div>
      </dl>
    </section>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, HandCoins, House, Loader2, type LucideIcon } from "lucide-react";

import { AUTH_COPY } from "@/lib/constants";
import type { Role } from "@/lib/types";

const ROLE_ORDER: readonly Role[] = ["customer", "worker"];

export const ROLE_ICONS: Record<Role, LucideIcon> = { customer: House, worker: HandCoins };

type RolePickerProps =
  | {
      /** Two large link cards (the `/signup` picker). One tap continues. */
      variant: "page";
      hrefFor: (role: Role) => string;
      headingLevel?: 2 | 3;
    }
  | {
      /** Two option buttons (inside the social sign-in dialog). */
      variant: "compact";
      onSelect: (role: Role) => void;
      pendingRole?: Role | null;
    };

/**
 * "I need help with chores" / "I want to earn doing chores" (PRD). Plain
 * link cards on the page (decision 14: not `SelectableCard`), and compact
 * buttons inside the dialog.
 */
export function RolePicker(props: RolePickerProps) {
  if (props.variant === "compact") {
    const { onSelect, pendingRole = null } = props;
    return (
      <ul className="flex flex-col gap-3">
        {ROLE_ORDER.map((role) => {
          const Icon = ROLE_ICONS[role];
          const copy = AUTH_COPY.picker[role];
          const pending = pendingRole === role;
          return (
            <li key={role}>
              <button
                type="button"
                disabled={pendingRole !== null}
                aria-busy={pending || undefined}
                onClick={() => onSelect(role)}
                className="flex min-h-16 w-full cursor-pointer items-center gap-4 rounded-md border border-input bg-surface p-4 text-left transition-colors duration-150 hover:bg-surface-alt disabled:cursor-default disabled:opacity-50 motion-reduce:transition-none"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand">
                  <Icon className="size-5 text-brand-foreground" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-body font-semibold text-ink">{copy.title}</span>
                  <span className="block text-body-sm text-ink-muted">{copy.description}</span>
                </span>
                {pending ? (
                  <Loader2
                    className="size-5 shrink-0 text-ink motion-safe:animate-spin"
                    aria-hidden
                  />
                ) : (
                  <ChevronRight className="size-5 shrink-0 text-ink" aria-hidden />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  const { hrefFor, headingLevel = 2 } = props;
  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:gap-8">
      {ROLE_ORDER.map((role) => {
        const Icon = ROLE_ICONS[role];
        const copy = AUTH_COPY.picker[role];
        return (
          <li key={role} className="min-w-0">
            <Link
              href={hrefFor(role)}
              className="group flex h-full flex-col gap-4 rounded-lg border border-border bg-surface p-6 transition-colors duration-150 hover:border-input hover:bg-surface-alt motion-reduce:transition-none lg:p-8"
            >
              <span className="flex size-12 items-center justify-center rounded-md bg-brand">
                <Icon className="size-6 text-brand-foreground" aria-hidden />
              </span>
              <Heading className="text-h4">{copy.title}</Heading>
              <p className="text-body text-ink-muted">{copy.description}</p>
              <span
                aria-hidden
                className="mt-auto inline-flex items-center gap-2 text-body-sm font-semibold text-ink underline-offset-4 group-hover:underline"
              >
                {copy.action}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

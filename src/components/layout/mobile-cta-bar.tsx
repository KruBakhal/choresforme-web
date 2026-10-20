import Link from "next/link";
import { Plus, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HEADER_ACTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type MobileCtaBarProps = {
  /** Button label. Defaults to "Post a job". */
  label?: string;
  /** Button target. Defaults to the job builder. */
  href?: string;
  /** Leading icon. Defaults to `Plus`. */
  icon?: LucideIcon;
  /** Styleguide only: render in flow and at every width. */
  preview?: boolean;
};

/** Sticky CTA bar for mobile (< 768 px), "Post a job" by default. Rendered last by Footer. */
export function MobileCtaBar({
  label = HEADER_ACTIONS.postJob.label,
  href = HEADER_ACTIONS.postJob.href,
  icon: Icon = Plus,
  preview = false,
}: MobileCtaBarProps) {
  return (
    <div
      className={cn(
        "border-t border-border bg-surface px-4 pt-3 pb-safe",
        preview ? "static" : "fixed inset-x-0 bottom-0 z-40 md:hidden",
      )}
    >
      <Button asChild className="w-full">
        <Link href={href}>
          <Icon aria-hidden />
          {label}
        </Link>
      </Button>
    </div>
  );
}

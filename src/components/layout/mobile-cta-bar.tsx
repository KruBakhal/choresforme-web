import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HEADER_ACTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type MobileCtaBarProps = {
  /** Styleguide only: render in flow and at every width. */
  preview?: boolean;
};

/** Sticky "Post a job" bar for mobile (< 768 px). Rendered last by Footer. */
export function MobileCtaBar({ preview = false }: MobileCtaBarProps) {
  return (
    <div
      className={cn(
        "border-t border-border bg-surface px-4 pt-3 pb-safe",
        preview ? "static" : "fixed inset-x-0 bottom-0 z-40 md:hidden",
      )}
    >
      <Button asChild className="w-full">
        <Link href={HEADER_ACTIONS.postJob.href}>
          <Plus aria-hidden />
          {HEADER_ACTIONS.postJob.label}
        </Link>
      </Button>
    </div>
  );
}

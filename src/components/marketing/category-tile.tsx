import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CATEGORY_ICONS } from "@/lib/constants";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

type CategoryTileProps = {
  category: Category;
  /** Without `href` the tile is a plain card with no action row. */
  href?: string;
  description?: string;
  actionLabel?: string;
  headingLevel?: 3 | 4;
};

/** Icon, name and description for one category. T6 step 1 can pass its own `href`. */
export function CategoryTile({
  category,
  href,
  description,
  actionLabel,
  headingLevel = 3,
}: CategoryTileProps) {
  const Icon = CATEGORY_ICONS[category.id];
  const Heading = headingLevel === 4 ? "h4" : "h3";

  const content = (
    <>
      <span className="flex size-10 items-center justify-center rounded-md bg-brand md:size-12">
        <Icon className="size-5 text-brand-foreground md:size-6" aria-hidden />
      </span>
      <Heading className="text-body font-semibold text-ink md:text-h4">{category.name}</Heading>
      {description && <p className="text-body-sm text-ink-muted">{description}</p>}
      {href && actionLabel && (
        <span
          aria-hidden
          className="mt-auto inline-flex items-center gap-2 text-body-sm font-semibold text-ink underline-offset-4 group-hover:underline"
        >
          {actionLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
        </span>
      )}
    </>
  );

  const cardClass =
    "flex h-full flex-col gap-4 rounded-lg border border-border bg-surface p-4 md:p-6";

  if (!href) {
    return <div className={cardClass}>{content}</div>;
  }

  return (
    <Link
      href={href}
      className={cn(
        cardClass,
        "group transition-colors duration-150 hover:border-input motion-reduce:transition-none",
      )}
    >
      {content}
    </Link>
  );
}

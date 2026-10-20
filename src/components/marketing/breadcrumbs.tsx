import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { A11Y, type LinkItem } from "@/lib/constants";

type BreadcrumbsProps = {
  /** The last item is the current page and is not a link. */
  items: readonly LinkItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label={A11Y.breadcrumb}>
      <ol className="flex flex-wrap items-center gap-x-2 text-body-sm">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-x-2">
              {isCurrent ? (
                <span aria-current="page" className="text-ink-muted">
                  {item.label}
                </span>
              ) : (
                <>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center rounded-md text-ink underline decoration-1 underline-offset-4 hover:decoration-2"
                  >
                    {item.label}
                  </Link>
                  <ChevronRight className="size-4 text-ink-muted" aria-hidden />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

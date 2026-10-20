import { Check } from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { OTHER_SUB_SERVICE, SERVICE_PAGE_COPY } from "@/lib/constants";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

type ServiceIncludesProps = { category: Category; headingId: string };

/** The category's sub-services. "Other" becomes the "describe it" card. */
export function ServiceIncludes({ category, headingId }: ServiceIncludesProps) {
  const onlyOther = category.subServices.length === 1;

  return (
    <>
      <SectionHeading
        id={headingId}
        title={SERVICE_PAGE_COPY.includesTitle}
        intro={onlyOther ? undefined : SERVICE_PAGE_COPY.includesIntro}
      />
      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {category.subServices.map((service) => {
          const isOther = service === OTHER_SUB_SERVICE;
          return (
            <li
              key={service}
              className={cn(
                "flex items-center gap-3 rounded-md border border-border bg-surface p-4",
                onlyOther && "sm:col-span-2 lg:col-span-3",
              )}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-soft">
                <Check className="size-5 text-ink" aria-hidden />
              </span>
              <span className={cn("min-w-0 text-body text-ink", !onlyOther && "font-semibold")}>
                {onlyOther
                  ? SERVICE_PAGE_COPY.customIncludesBody
                  : isOther
                    ? SERVICE_PAGE_COPY.otherLabel
                    : service}
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

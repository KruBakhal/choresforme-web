import Link from "next/link";

import { CATEGORIES, CATEGORY_ICONS, LANDING_COPY, postJobForCategory } from "@/lib/constants";

type HeroCategoryPickerProps = { labelId: string };

/** The four categories as compact links into the job builder, category pre-selected. */
export function HeroCategoryPicker({ labelId }: HeroCategoryPickerProps) {
  return (
    <div>
      <p id={labelId} className="text-body-sm font-semibold text-ink">
        {LANDING_COPY.hero.pickerLabel}
      </p>
      <ul aria-labelledby={labelId} className="mt-3 grid grid-cols-2 gap-3">
        {CATEGORIES.map((category) => {
          const Icon = CATEGORY_ICONS[category.id];
          return (
            <li key={category.id} className="min-w-0">
              <Link
                href={postJobForCategory(category.id)}
                className="flex h-full min-h-12 items-center gap-2 rounded-md border border-input bg-surface px-3 py-2 text-left text-body-sm font-semibold text-ink transition-colors duration-150 hover:bg-surface-alt motion-reduce:transition-none"
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

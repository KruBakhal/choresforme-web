import { SECTIONS } from "@/app/styleguide/_data/tokens";
import { STYLEGUIDE_COPY } from "@/lib/constants";

/** Section links as wrapping chips (never scrolls sideways). */
export function StyleguideToc() {
  return (
    <nav aria-label={STYLEGUIDE_COPY.tocLabel}>
      <ol className="flex flex-wrap gap-2">
        {SECTIONS.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="inline-flex h-11 items-center rounded-full border border-input px-4 text-body-sm text-ink transition-colors duration-150 hover:bg-surface-alt motion-reduce:transition-none"
            >
              {index + 1} {STYLEGUIDE_COPY.sections[section.key].title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

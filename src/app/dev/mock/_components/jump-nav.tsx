import { DEV_MOCK_COPY } from "@/lib/constants";

/** In-page section chips. They wrap, so they never scroll sideways. */
export function JumpNav() {
  return (
    <nav aria-label={DEV_MOCK_COPY.jumpNavLabel}>
      <ul className="flex flex-wrap gap-2">
        {DEV_MOCK_COPY.sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="inline-flex h-11 items-center rounded-full border border-input px-4 text-body-sm text-ink transition-colors duration-150 hover:bg-surface-alt motion-reduce:transition-none"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

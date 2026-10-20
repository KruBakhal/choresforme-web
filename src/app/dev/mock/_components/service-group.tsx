import { ServiceCall } from "@/app/dev/mock/_components/service-call";
import type { ServiceGroupDef } from "@/app/dev/mock/_data/service-calls";

/** A service namespace (auth, jobs, …) and its calls. */
export function ServiceGroup({ group }: { group: ServiceGroupDef }) {
  const titleId = `${group.id}-title`;

  return (
    <section id={group.id} aria-labelledby={titleId} className="min-w-0 scroll-mt-8">
      <h2 id={titleId} className="text-h3">
        {group.title}
      </h2>
      {group.intro && <p className="mt-1 text-body-sm text-ink-muted">{group.intro}</p>}
      <ul className="mt-4 flex flex-col gap-4">
        {group.calls.map((call) => (
          <ServiceCall key={call.id} call={call} />
        ))}
      </ul>
    </section>
  );
}

"use client";

import * as React from "react";
import { Search, SearchX } from "lucide-react";

import { ExternalLink } from "@/components/marketing/external-link";
import { EmptyState } from "@/components/states/empty-state";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FAQ_AUDIENCES, FAQ_COPY, type FaqItem } from "@/lib/constants";

type FaqAccordionProps = {
  items: readonly FaqItem[];
  /** Show the search field, results line and no-results state (/faq). */
  searchable?: boolean;
  /** Group items under "For customers" / "For workers" h2 headings (/faq). */
  grouped?: boolean;
  /** Give each item its slug as DOM id and open the item named in the URL hash (/faq). */
  anchorIds?: boolean;
};

const SEARCH_ID = "faq-search";
const RESULTS_ID = "faq-results";

function normalise(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function FaqAccordion({
  items,
  searchable = false,
  grouped = false,
  anchorIds = false,
}: FaqAccordionProps) {
  const [query, setQuery] = React.useState("");
  const [openValues, setOpenValues] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  /* Item to scroll to and focus after the next render (set by the URL hash). */
  const pendingHashId = React.useRef<string | null>(null);

  const needle = normalise(query);
  const visibleItems = needle
    ? items.filter((item) => normalise(`${item.question} ${item.answer}`).includes(needle))
    : items;

  React.useEffect(() => {
    if (!anchorIds) return;

    function openFromHash() {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id || !items.some((item) => item.id === id)) return;
      pendingHashId.current = id;
      setQuery("");
      /* Always a new array, so a re-render runs the scroll effect below. */
      setOpenValues((values) => (values.includes(id) ? [...values] : [...values, id]));
    }

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [anchorIds, items]);

  React.useEffect(() => {
    const id = pendingHashId.current;
    if (!id) return;
    pendingHashId.current = null;
    const element = document.getElementById(id);
    if (!element) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
    element
      .querySelector<HTMLButtonElement>("[data-slot=accordion-trigger]")
      ?.focus({ preventScroll: true });
  });

  function clearSearch() {
    setQuery("");
    inputRef.current?.focus();
  }

  function renderAccordion(list: readonly FaqItem[]) {
    return (
      <Accordion type="multiple" value={openValues} onValueChange={setOpenValues}>
        {list.map((item) => (
          <AccordionItem
            key={item.id}
            value={item.id}
            id={anchorIds ? item.id : undefined}
            className={anchorIds ? "scroll-mt-24" : undefined}
          >
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>
              <p>{item.answer}</p>
              {item.link && (
                <Button asChild variant="link" size="sm" className="mt-3">
                  <ExternalLink href={item.link.href}>{item.link.label}</ExternalLink>
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  }

  const isEmpty = visibleItems.length === 0;

  return (
    <div>
      {searchable && (
        <>
          <label htmlFor={SEARCH_ID} className="text-body font-semibold text-ink">
            {FAQ_COPY.searchLabel}
          </label>
          <div className="relative mt-2">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-muted"
              aria-hidden
            />
            <input
              ref={inputRef}
              id={SEARCH_ID}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={FAQ_COPY.searchPlaceholder}
              autoComplete="off"
              enterKeyHint="search"
              aria-describedby={RESULTS_ID}
              className="h-12 w-full rounded-md border border-input bg-surface pr-4 pl-12 text-body text-ink placeholder:text-ink-muted"
            />
          </div>
          <p
            id={RESULTS_ID}
            role="status"
            aria-live="polite"
            className="mt-3 flex flex-wrap items-center gap-x-3 text-body-sm text-ink-muted"
          >
            <span>
              {isEmpty
                ? FAQ_COPY.noResultsLine(query.trim())
                : FAQ_COPY.resultsCount(visibleItems.length, items.length)}
            </span>
            {needle && (
              <Button type="button" variant="link" size="sm" onClick={clearSearch}>
                {FAQ_COPY.clearSearch}
              </Button>
            )}
          </p>
        </>
      )}

      <div className={searchable ? "mt-8" : undefined}>
        {isEmpty ? (
          <EmptyState
            icon={SearchX}
            headingLevel={2}
            title={FAQ_COPY.noResultsTitle}
            description={FAQ_COPY.noResultsDescription}
            action={
              <Button type="button" variant="outline" onClick={clearSearch}>
                {FAQ_COPY.clearSearch}
              </Button>
            }
          />
        ) : grouped ? (
          <div className="flex flex-col gap-12">
            {FAQ_AUDIENCES.map((audience) => {
              const groupItems = visibleItems.filter((item) => item.audience === audience);
              if (groupItems.length === 0) return null;
              return (
                <div key={audience}>
                  <h2 className="text-h3">{FAQ_COPY.groups[audience]}</h2>
                  <div className="mt-4">{renderAccordion(groupItems)}</div>
                </div>
              );
            })}
          </div>
        ) : (
          renderAccordion(visibleItems)
        )}
      </div>
    </div>
  );
}

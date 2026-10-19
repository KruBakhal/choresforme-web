import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { ErrorStateDemo } from "@/app/styleguide/_components/error-state-demo";
import { PreviewFrame } from "@/app/styleguide/_components/preview-frame";
import { SgSection } from "@/app/styleguide/_components/sg-section";
import { SheetDemo } from "@/app/styleguide/_components/sheet-demo";
import { StyleguideToc } from "@/app/styleguide/_components/styleguide-toc";
import { Swatch } from "@/app/styleguide/_components/swatch";
import {
  ALIASES,
  BREAKPOINTS,
  BUTTON_LABELS,
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  FONT_FAMILY,
  RADII,
  SPACING,
  SWATCHES,
  TYPE_SCALE,
  WEIGHTS,
} from "@/app/styleguide/_data/tokens";
import { AppShell } from "@/components/layout/app-shell";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Logo } from "@/components/layout/logo";
import { SideNav } from "@/components/layout/side-nav";
import { EmptyState } from "@/components/states/empty-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { HEADER_ACTIONS, NAV_ITEMS, STATE_COPY, STYLEGUIDE_COPY } from "@/lib/constants";

export const metadata: Metadata = {
  title: STYLEGUIDE_COPY.metaTitle,
  robots: { index: false, follow: false },
};

const S = STYLEGUIDE_COPY.sections;
const C = STYLEGUIDE_COPY.captions;

function ButtonRow({ variant }: { variant: (typeof BUTTON_VARIANTS)[number] | "inverse" }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {BUTTON_SIZES.map((size) => (
        <Button key={size} variant={variant} size={size}>
          {BUTTON_LABELS[size]}
        </Button>
      ))}
      {variant !== "link" && (
        <Button variant={variant} size="icon">
          <Plus aria-hidden />
          <span className="sr-only">{BUTTON_LABELS.icon}</span>
        </Button>
      )}
      <Button variant={variant} disabled>
        {BUTTON_LABELS.disabled}
      </Button>
      <Button variant={variant} loading>
        {STATE_COPY.submittingExample}
      </Button>
    </div>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-body-sm text-ink-muted">{children}</p>;
}

export default function StyleguidePage() {
  return (
    <>
      <Container className="py-12">
        <Logo />
        <h1 className="mt-8 text-h2 font-semibold text-ink md:text-h1">{STYLEGUIDE_COPY.title}</h1>
        <p className="mt-2 text-body text-ink-muted">{STYLEGUIDE_COPY.intro}</p>
        <div className="mt-8">
          <StyleguideToc />
        </div>
      </Container>

      <Container className="pb-24">
        <main id="main" tabIndex={-1} className="min-w-0">
          {/* 1. Brand */}
          <SgSection id="brand" title={S.brand.title} intro={S.brand.intro}>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <div className="flex items-center rounded-lg border border-border bg-surface p-8">
                  <Logo href={null} />
                </div>
                <Caption>{C.lockupOnLight}</Caption>
              </div>
              <div>
                <div className="flex items-center rounded-lg bg-surface-dark p-8">
                  <Logo href={null} tone="onDark" />
                </div>
                <Caption>{C.lockupOnDark}</Caption>
              </div>
              <div className="flex flex-wrap gap-6">
                <div>
                  <Logo href={null} variant="mark" size="xl" />
                  <Caption>{C.markOnBrand}</Caption>
                </div>
                <div>
                  <Logo href={null} variant="mark" size="xl" tileTone="dark" />
                  <Caption>{C.markOnDark}</Caption>
                </div>
              </div>
            </div>
          </SgSection>

          <Separator className="my-16" />

          {/* 2. Colours */}
          <SgSection id="colours" title={S.colours.title} intro={S.colours.intro}>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {SWATCHES.map((swatch) => (
                <Swatch key={swatch.token} {...swatch} />
              ))}
            </div>
            <h3 className="mt-12 text-h4 font-semibold text-ink">{C.aliases}</h3>
            <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 md:grid-cols-2">
              {ALIASES.map((row) => (
                <div key={row.alias} className="flex flex-wrap gap-2 text-body-sm">
                  <dt className="font-semibold text-ink">{row.alias}</dt>
                  <dd className="text-ink-muted">→ {row.token}</dd>
                </div>
              ))}
            </dl>
          </SgSection>

          <Separator className="my-16" />

          {/* 3. Typography */}
          <SgSection id="typography" title={S.typography.title} intro={S.typography.intro}>
            <ul>
              {TYPE_SCALE.map((step) => (
                <li
                  key={step.name}
                  className="flex flex-col gap-2 border-b border-border py-4 md:flex-row md:items-baseline md:gap-8"
                >
                  <p className="shrink-0 text-body-sm text-ink-muted md:w-60">
                    <span className="font-semibold text-ink">{step.name}</span> · {step.spec}
                  </p>
                  <p className={`min-w-0 break-words text-ink ${step.className}`}>
                    {STYLEGUIDE_COPY.samples.typeSentence}
                  </p>
                </li>
              ))}
              <li className="flex flex-col gap-2 border-b border-border py-4 md:flex-row md:items-baseline md:gap-8">
                <p className="shrink-0 text-body-sm font-semibold text-ink md:w-60">{C.weights}</p>
                <div className="flex flex-wrap gap-8">
                  {WEIGHTS.map((weight) => (
                    <p key={weight.label} className={`text-body text-ink ${weight.className}`}>
                      {weight.label}
                    </p>
                  ))}
                </div>
              </li>
              <li className="flex flex-col gap-2 py-4 md:flex-row md:items-baseline md:gap-8">
                <p className="shrink-0 text-body-sm font-semibold text-ink md:w-60">{C.family}</p>
                <p className="text-body text-ink">{FONT_FAMILY}</p>
              </li>
            </ul>
          </SgSection>

          <Separator className="my-16" />

          {/* 4. Spacing and layout */}
          <SgSection id="spacing" title={S.spacing.title} intro={S.spacing.intro}>
            <ul className="flex flex-col gap-3">
              {SPACING.map((space) => (
                <li key={space.step} className="flex items-center gap-4">
                  <span className="w-24 shrink-0 text-body-sm text-ink-muted">
                    {space.px} px · {space.step}
                  </span>
                  <span className={`h-4 rounded-sm bg-brand ${space.barClass}`} aria-hidden />
                </li>
              ))}
            </ul>

            <h3 className="mt-12 text-h4 font-semibold text-ink">{C.radii}</h3>
            <div className="mt-4 flex flex-wrap gap-6">
              {RADII.map((radius) => (
                <div key={radius.name}>
                  <div
                    className={`size-24 border border-input bg-brand-soft ${radius.className}`}
                  />
                  <p className="mt-2 text-body-sm text-ink-muted">
                    {radius.name} · {radius.px} px
                  </p>
                </div>
              ))}
            </div>

            <h3 className="mt-12 text-h4 font-semibold text-ink">{C.breakpoints}</h3>
            <dl className="mt-4 flex flex-col gap-2">
              {BREAKPOINTS.map((bp) => (
                <div key={bp.name} className="flex flex-wrap gap-2 text-body-sm">
                  <dt className="font-semibold text-ink">{bp.name}</dt>
                  <dd className="text-ink-muted">{bp.value}</dd>
                </div>
              ))}
            </dl>

            <h3 className="mt-12 text-h4 font-semibold text-ink">{C.grid}</h3>
            <div className="mt-4 grid grid-cols-4 gap-4 md:grid-cols-8 md:gap-6 lg:grid-cols-12 lg:gap-8">
              {Array.from({ length: 12 }, (_, i) => (
                <div
                  key={i}
                  aria-hidden
                  className={
                    i >= 8
                      ? "hidden h-12 rounded-sm bg-brand-soft lg:block"
                      : i >= 4
                        ? "hidden h-12 rounded-sm bg-brand-soft md:block"
                        : "h-12 rounded-sm bg-brand-soft"
                  }
                />
              ))}
            </div>

            <div className="mt-12 flex items-center gap-4">
              <div
                className="size-11 shrink-0 rounded-md border-2 border-dashed border-input"
                aria-hidden
              />
              <p className="text-body-sm text-ink">{C.touchTarget}</p>
            </div>
          </SgSection>

          <Separator className="my-16" />

          {/* 5. Primitives */}
          <SgSection id="primitives" title={S.primitives.title} intro={S.primitives.intro}>
            <h3 className="text-h4 font-semibold text-ink">{C.buttons}</h3>
            <div className="mt-4 flex flex-col gap-8">
              {BUTTON_VARIANTS.map((variant) => (
                <div key={variant}>
                  <p className="mb-3 text-body-sm font-semibold text-ink-muted">{variant}</p>
                  <ButtonRow variant={variant} />
                </div>
              ))}
              <div className="rounded-lg bg-surface-dark p-6">
                <p className="mb-3 text-body-sm font-semibold text-surface">inverse</p>
                <ButtonRow variant="inverse" />
              </div>
            </div>

            <h3 className="mt-12 text-h4 font-semibold text-ink">{C.separator}</h3>
            <div className="mt-4 flex flex-col gap-6">
              <Separator />
              <div className="flex h-12 items-center gap-4 text-body-sm text-ink">
                <span>{BUTTON_LABELS.sm}</span>
                <Separator orientation="vertical" />
                <span>{BUTTON_LABELS.default}</span>
                <Separator orientation="vertical" />
                <span>{BUTTON_LABELS.lg}</span>
              </div>
            </div>

            <h3 className="mt-12 text-h4 font-semibold text-ink">{C.skeleton}</h3>
            <div className="mt-4 flex items-center gap-4">
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>

            <h3 className="mt-12 text-h4 font-semibold text-ink">{C.sheet}</h3>
            <div className="mt-4">
              <SheetDemo />
            </div>
          </SgSection>

          <Separator className="my-16" />

          {/* 6. Header and Footer */}
          <SgSection id="header-footer" title={S.headerFooter.title} intro={S.headerFooter.intro}>
            <div className="flex flex-col gap-8">
              <PreviewFrame caption={C.header} bleed>
                <Header preview />
              </PreviewFrame>
              <PreviewFrame caption={`${C.footer}. ${C.mobileCta}`} bleed>
                <Footer preview />
              </PreviewFrame>
            </div>
          </SgSection>

          <Separator className="my-16" />

          {/* 7. App shell */}
          <SgSection id="app-shell" title={S.appShell.title} intro={S.appShell.intro}>
            <div className="flex flex-col gap-8">
              <PreviewFrame caption={C.customerShell} bg="surface-alt" bleed>
                <AppShell
                  role="customer"
                  preview
                  activeHref={NAV_ITEMS.customer[0].href}
                  railLabel={C.railLabel}
                  rail={
                    <div className="rounded-lg border border-border bg-surface p-6">
                      <h3 className="text-h4 font-semibold text-ink">{C.railTitle}</h3>
                      <p className="mt-2 text-body-sm text-ink-muted">{C.railBody}</p>
                    </div>
                  }
                >
                  <div className="flex flex-col gap-6">
                    <LoadingState variant="cards" count={2} />
                    <EmptyState
                      headingLevel={3}
                      title={STYLEGUIDE_COPY.samples.emptyTitle}
                      description={STYLEGUIDE_COPY.samples.emptyDescription}
                    />
                  </div>
                </AppShell>
              </PreviewFrame>

              <PreviewFrame caption={C.workerShell} bg="surface-alt" bleed>
                <AppShell role="worker" preview activeHref={NAV_ITEMS.worker[0].href}>
                  <div className="flex flex-col gap-6">
                    <LoadingState variant="cards" count={2} />
                    <EmptyState
                      headingLevel={3}
                      title={STYLEGUIDE_COPY.samples.emptyTitle}
                      description={STYLEGUIDE_COPY.samples.emptyDescription}
                    />
                  </div>
                </AppShell>
              </PreviewFrame>

              <div className="flex flex-wrap gap-6">
                <PreviewFrame caption={C.sideNavFull}>
                  <SideNav
                    role="customer"
                    mode="full"
                    preview
                    activeHref={NAV_ITEMS.customer[1].href}
                    className="border-r-0"
                  />
                </PreviewFrame>
                <PreviewFrame caption={C.sideNavIcon}>
                  <SideNav
                    role="customer"
                    mode="icon"
                    preview
                    activeHref={NAV_ITEMS.customer[1].href}
                    className="border-r-0"
                  />
                </PreviewFrame>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <PreviewFrame caption={C.bottomNavCustomer}>
                  <BottomNav role="customer" preview activeHref={NAV_ITEMS.customer[0].href} />
                </PreviewFrame>
                <PreviewFrame caption={C.bottomNavWorker}>
                  <BottomNav role="worker" preview activeHref={NAV_ITEMS.worker[0].href} />
                </PreviewFrame>
              </div>
            </div>
          </SgSection>

          <Separator className="my-16" />

          {/* 8. States */}
          <SgSection id="states" title={S.states.title} intro={S.states.intro}>
            <div className="flex flex-col gap-8">
              {(["cards", "rows", "detail", "summary"] as const).map((variant) => (
                <PreviewFrame
                  key={variant}
                  caption={`${C.loading} · ${variant}`}
                  bg="surface-alt"
                  bodyClassName="p-6"
                >
                  <LoadingState variant={variant} />
                </PreviewFrame>
              ))}

              <PreviewFrame caption={C.emptyWithAction} bg="surface-alt" bodyClassName="p-6">
                <EmptyState
                  headingLevel={3}
                  title={STYLEGUIDE_COPY.samples.emptyTitle}
                  description={STYLEGUIDE_COPY.samples.emptyDescription}
                  action={
                    <Button asChild>
                      <Link href={HEADER_ACTIONS.postJob.href}>
                        <Plus aria-hidden />
                        {HEADER_ACTIONS.postJob.label}
                      </Link>
                    </Button>
                  }
                />
              </PreviewFrame>

              <PreviewFrame caption={C.emptyWithoutAction} bg="surface-alt" bodyClassName="p-6">
                <EmptyState headingLevel={3} title={STYLEGUIDE_COPY.samples.emptyTitle} />
              </PreviewFrame>

              <PreviewFrame caption={C.error} bg="surface-alt" bodyClassName="p-6">
                <ErrorStateDemo />
              </PreviewFrame>
            </div>
          </SgSection>
        </main>
      </Container>
    </>
  );
}

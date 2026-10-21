"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Info, Lock, MapPinOff, SearchX } from "lucide-react";
import { useForm, useWatch, type Path, type Resolver, type UseFormReturn } from "react-hook-form";
import type { z } from "zod";

import { rememberJobSaved } from "@/components/dashboard/job-flash";
import { PageHeader } from "@/components/dashboard/page-header";
import { usePageTitleFocus } from "@/components/dashboard/use-page-title-focus";
import { AddressInput, type AddressFieldValues } from "@/components/forms/address-input";
import { DescriptionField, type DescriptionForm } from "@/components/forms/description-field";
import { focusFirstError } from "@/components/forms/focus-first-error";
import { FormAlert, nextAlertKey } from "@/components/forms/form-alert";
import { SubServicesField, type SubServicesForm } from "@/components/forms/sub-services-field";
import {
  PriceInput,
  type PriceFormValues,
  type PriceInputForm,
} from "@/components/job/price-input";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_ICONS,
  DASHBOARD_COPY,
  JOB_BUILDER_COPY,
  MATCH_TYPE_LABELS,
  OTHER_SUB_SERVICE,
  ROLE_HOME,
  SERVICE_MESSAGES,
} from "@/lib/constants";
import {
  findCategory,
  isServedState,
  parseAmount,
  servedStatesText,
  stateName,
} from "@/lib/job-builder";
import { useRevisitKey } from "@/lib/hooks/use-revisit-key";
import { isServiceError, jobs as jobService } from "@/lib/mock/services";
import { useSessionStore } from "@/lib/store";
import type { Category, Job, JobPatch } from "@/lib/types";
import { addressSchema, jobEditSchema, zodResolver } from "@/lib/validation";

type Values = AddressFieldValues &
  PriceFormValues & {
    subServices: string[];
    otherText: string;
    description: string;
  };
type Output = z.output<typeof jobEditSchema>;
type State = Values["address"]["state"];

type Load =
  | { status: "loading" }
  | { status: "error"; retrying: boolean }
  | { status: "notFound" }
  | { status: "ready"; job: Job };

const COPY = DASHBOARD_COPY.edit;
const FIELD_ORDER = [
  "subServices",
  "otherText",
  "address.line1",
  "address.city",
  "address.state",
  "address.zip",
  "description",
  "amount",
  "hours",
] as const satisfies readonly Path<Values>[];
const OUT_OF_AREA_TITLE_ID = "edit-out-of-area-title";
const SERVICES_TITLE_ID = "edit-services-title";

const detailHref = (id: string) => `/dashboard/jobs/${encodeURIComponent(id)}`;

/**
 * `/dashboard/jobs/[id]/edit` (T8 open question 1). Keyed per visit and per
 * id (`useRevisitKey`). Render inside `<Suspense>`.
 */
export function EditJobRoute() {
  const revisitKey = useRevisitKey();
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id ?? "");
  return <EditJobView key={`${revisitKey}:${id}`} jobId={id} />;
}

function EditJobView({ jobId }: { jobId: string }) {
  const userId = useSessionStore((state) => state.session?.user.id ?? null);
  const [load, setLoad] = React.useState<Load>({ status: "loading" });
  const startedOnMount = React.useRef(false);

  const loadJob = React.useCallback(async () => {
    try {
      const job = await jobService.get(jobId);
      setLoad(job.customerId === userId ? { status: "ready", job } : { status: "notFound" });
    } catch (caught) {
      setLoad(
        isServiceError(caught) && caught.code === "JOB_NOT_FOUND"
          ? { status: "notFound" }
          : { status: "error", retrying: false },
      );
    }
  }, [jobId, userId]);

  React.useEffect(() => {
    // Once per mount (Strict Mode runs effects twice; a second request would hide a ?mockError=1 failure).
    if (startedOnMount.current) return;
    startedOnMount.current = true;
    void loadJob();
  }, [loadJob]);

  if (load.status === "loading")
    return <LoadingState variant="form" label={DASHBOARD_COPY.detail.loading} />;

  if (load.status === "notFound") {
    return (
      <EmptyState
        headingLevel={1}
        icon={SearchX}
        title={DASHBOARD_COPY.detail.notFoundTitle}
        description={DASHBOARD_COPY.detail.notFoundDescription}
        action={
          <Button asChild>
            <Link href={ROLE_HOME.customer}>{DASHBOARD_COPY.detail.backToDashboard}</Link>
          </Button>
        }
      />
    );
  }

  if (load.status === "error") {
    return (
      <ErrorState
        headingLevel={1}
        isRetrying={load.retrying}
        onRetry={() => {
          setLoad({ status: "error", retrying: true });
          void loadJob();
        }}
        secondaryAction={
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={ROLE_HOME.customer}>{DASHBOARD_COPY.detail.backToDashboard}</Link>
          </Button>
        }
      />
    );
  }

  const category = findCategory(load.job.category);
  if (load.job.status !== "open" || !category) {
    return (
      <EmptyState
        headingLevel={1}
        icon={Lock}
        title={COPY.lockedTitle}
        description={COPY.lockedDescription}
        action={
          <Button asChild>
            <Link href={detailHref(load.job.id)}>{COPY.backToJob}</Link>
          </Button>
        }
      />
    );
  }

  return <EditJobForm job={load.job} category={category} />;
}

function defaultValues(job: Job): Values {
  const hourly = job.pricingType === "hourly";
  return {
    subServices: [...job.subServices],
    otherText: job.otherText ?? "",
    address: {
      line1: job.address.line1,
      city: job.address.city,
      state: job.address.state as State,
      zip: job.address.zip,
      landmark: job.address.landmark ?? "",
    },
    description: job.description,
    pricingType: job.pricingType,
    amount: String(job.amount),
    hours: hourly && job.hours !== undefined ? String(job.hours) : "",
  };
}

const schemaResolver = zodResolver(jobEditSchema);

function EditJobForm({ job, category }: { job: Job; category: Category }) {
  const router = useRouter();
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<{ key: number; notAllowed: boolean } | null>(
    null,
  );

  usePageTitleFocus(titleRef, true);

  // The typed amount and hours become numbers; the category is the job's (not editable).
  const resolver = React.useMemo<Resolver<Values, unknown, Output>>(
    () => (values, context, options) => {
      const hourly = values.pricingType === "hourly";
      return schemaResolver(
        {
          category: job.category,
          subServices: values.subServices,
          otherText: values.otherText,
          address: values.address,
          description: values.description,
          pricingType: values.pricingType,
          amount: parseAmount(values.amount),
          hours: hourly && values.hours ? Number(values.hours) : undefined,
        } as Parameters<typeof schemaResolver>[0],
        context,
        options as unknown as Parameters<typeof schemaResolver>[2],
      ) as ReturnType<Resolver<Values, unknown, Output>>;
    },
    [job.category],
  );

  const form = useForm<Values, unknown, Output>({
    resolver,
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: defaultValues(job),
  });
  const address = useWatch({ control: form.control, name: "address" });
  const parsedAddress = addressSchema.safeParse(address);
  const outOfArea =
    parsedAddress.success && !isServedState(parsedAddress.data.state) ? parsedAddress.data : null;

  async function onValid(output: Output) {
    if (saving) return;
    if (!isServedState(output.address.state)) {
      document.getElementById(OUT_OF_AREA_TITLE_ID)?.focus();
      return;
    }
    setSaving(true);
    setSaveError(null);
    const patch: JobPatch = {
      subServices: output.subServices,
      // The text is kept only while "Other" is selected.
      otherText: output.subServices.includes(OTHER_SUB_SERVICE) ? output.otherText : undefined,
      address: output.address,
      description: output.description,
      pricingType: output.pricingType,
      amount: output.amount,
      hours: output.pricingType === "hourly" ? output.hours : undefined,
    };
    try {
      await jobService.update(job.id, patch);
      rememberJobSaved(job.id);
      // Save keeps its spinner until the route changes.
      router.push(detailHref(job.id));
    } catch (caught) {
      // Errors never clear typed input.
      setSaving(false);
      setSaveError({
        key: nextAlertKey(),
        notAllowed: isServiceError(caught) && caught.code === "NOT_ALLOWED",
      });
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    void form.handleSubmit(onValid, focusFirstError(FIELD_ORDER, form.setFocus))(event);
  }

  const CategoryIcon = CATEGORY_ICONS[category.id];
  const card = "rounded-lg border border-border bg-surface p-4 md:p-6";

  return (
    <div className="max-w-2xl">
      <PageHeader
        className="mb-0"
        titleRef={titleRef}
        title={COPY.title}
        description={COPY.description}
        back={{ href: detailHref(job.id), label: COPY.backToJob }}
      />
      <form
        noValidate
        onSubmit={onSubmit}
        className="mt-8 flex flex-col gap-6 pb-24 *:scroll-mb-bars md:pb-0 md:*:scroll-mb-0"
      >
        {saveError && (
          <FormAlert
            key={saveError.key}
            tone="error"
            message={
              saveError.notAllowed ? SERVICE_MESSAGES.notAllowed : SERVICE_MESSAGES.mockError
            }
            action={
              saveError.notAllowed ? (
                <Button asChild variant="link" size="sm">
                  <Link href={detailHref(job.id)}>{COPY.backToJob}</Link>
                </Button>
              ) : undefined
            }
          />
        )}

        <section className={card}>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-body-sm font-semibold text-ink">{COPY.factsCategory}</dt>
              <dd className="mt-1 flex items-center gap-2 text-body text-ink">
                <CategoryIcon className="size-5 shrink-0" aria-hidden />
                {category.name}
              </dd>
            </div>
            <div>
              <dt className="text-body-sm font-semibold text-ink">{COPY.factsWho}</dt>
              <dd className="mt-1 text-body text-ink">{MATCH_TYPE_LABELS[job.matchType]}</dd>
            </div>
          </dl>
          <p className="mt-4 flex items-start gap-2 text-body-sm text-ink-muted">
            <Info className="size-4 shrink-0" aria-hidden />
            {COPY.categoryNote}
          </p>
        </section>

        <section aria-labelledby={SERVICES_TITLE_ID} className={card}>
          <h2 id={SERVICES_TITLE_ID} className="text-h4 font-semibold text-ink">
            {COPY.servicesTitle}
          </h2>
          <div className="mt-4">
            <SubServicesField
              form={form as unknown as SubServicesForm}
              category={category}
              labelledBy={SERVICES_TITLE_ID}
            />
          </div>
        </section>

        <section aria-labelledby="edit-where-title" className={card}>
          <h2 id="edit-where-title" className="text-h4 font-semibold text-ink">
            {COPY.whereTitle}
          </h2>
          <div className="mt-4 flex flex-col gap-6">
            <AddressInput
              form={form as unknown as UseFormReturn<AddressFieldValues, unknown, Output>}
              idPrefix="edit-address"
            />
            {outOfArea && (
              <div
                id="edit-out-of-area"
                className="flex items-start gap-4 rounded-md border border-input bg-surface p-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft">
                  <MapPinOff className="size-5 text-ink" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3
                    id={OUT_OF_AREA_TITLE_ID}
                    tabIndex={-1}
                    className="text-body font-semibold text-ink outline-none focus-visible:outline-2"
                  >
                    {JOB_BUILDER_COPY.notify.title(stateName(outOfArea.state))}
                  </h3>
                  <p className="mt-1 text-body-sm text-ink-muted">
                    {COPY.outOfAreaBody(servedStatesText())}
                  </p>
                </div>
              </div>
            )}
            <span className="sr-only" role="status">
              {outOfArea ? JOB_BUILDER_COPY.notify.title(stateName(outOfArea.state)) : ""}
            </span>
          </div>
        </section>

        <section aria-labelledby="edit-details-title" className={card}>
          <h2 id="edit-details-title" className="text-h4 font-semibold text-ink">
            {COPY.detailsTitle}
          </h2>
          <div className="mt-4 flex flex-col gap-6">
            <DescriptionField form={form as unknown as DescriptionForm} />
            <PriceInput form={form as unknown as PriceInputForm} />
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-above-nav z-40 flex gap-3 border-t border-border bg-surface px-4 py-3 md:static md:z-auto md:justify-end md:border-x-0 md:border-b-0 md:bg-transparent md:px-0 md:pt-6 md:pb-0">
          <Button asChild variant="outline">
            <Link href={detailHref(job.id)}>{COPY.cancel}</Link>
          </Button>
          <Button type="submit" className="flex-1 md:flex-none" loading={saving}>
            {saving ? COPY.saving : COPY.save}
          </Button>
        </div>
      </form>
    </div>
  );
}

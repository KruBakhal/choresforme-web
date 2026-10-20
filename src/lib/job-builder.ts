import {
  CATEGORIES,
  POST_JOB_STEPS,
  SERVED_STATES,
  US_STATES,
  type UsStateCode,
} from "@/lib/constants";
import type {
  Address,
  Category,
  CategoryId,
  JobDraft,
  PricingType,
  WorkerSummary,
} from "@/lib/types";
import {
  categoryIdSchema,
  categorySchema,
  detailsSchema,
  locationSchema,
  matchSchema,
  servicesSchema,
} from "@/lib/validation";

/*
 * Pure job builder helpers (T6): service area, step completeness, the price
 * estimate and display formatting. Safe on the server and the client.
 */

// Service area

export function isServedState(state: string | undefined): boolean {
  return !!state && SERVED_STATES.includes(state as UsStateCode);
}

export function stateName(code: string | undefined): string {
  return US_STATES.find((state) => state.code === code)?.name ?? code ?? "";
}

/** "Texas" or "Texas and Utah" or "Texas, Utah and Ohio". */
export function servedStatesText(): string {
  const names = SERVED_STATES.map(stateName);
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

// Categories

export function findCategory(id: string | null | undefined): Category | undefined {
  return CATEGORIES.find((category) => category.id === id);
}

/** A valid `?category=` value, or null (invalid values are ignored). */
export function parseCategoryParam(value: string | null | undefined): CategoryId | null {
  const parsed = categoryIdSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/**
 * The draft patch for choosing a category (decision 5): a new category drops
 * the services and the picked worker; the address and details stay. The same
 * category changes nothing.
 */
export function categoryChangePatch(draft: JobDraft, category: CategoryId): Partial<JobDraft> {
  if (draft.category === category) return {};
  return { category, subServices: undefined, otherText: undefined, workerId: undefined };
}

/** True when line 1, city, state or ZIP differ (the landmark does not count). */
export function isAddressChanged(a: Partial<Address> | undefined, b: Partial<Address> | undefined) {
  const key = (address: Partial<Address> | undefined) =>
    [address?.line1, address?.city, address?.state, address?.zip]
      .map((part) => (part ?? "").trim().toLowerCase())
      .join("|");
  return key(a) !== key(b);
}

// Step completeness and guards

const STEP_CHECKS: Record<number, (draft: JobDraft) => boolean> = {
  1: (draft) => categorySchema.safeParse({ category: draft.category }).success,
  2: (draft) =>
    servicesSchema.safeParse({
      category: draft.category,
      subServices: draft.subServices,
      otherText: draft.otherText,
    }).success,
  3: (draft) =>
    locationSchema.safeParse({ address: draft.address }).success &&
    isServedState(draft.address?.state),
  4: (draft) =>
    detailsSchema.safeParse({
      description: draft.description,
      photos: draft.photos,
      pricingType: draft.pricingType,
      amount: draft.amount,
      hours: draft.hours,
    }).success,
  5: (draft) =>
    matchSchema.safeParse({ matchType: draft.matchType, workerId: draft.workerId }).success,
};

export function isStepComplete(step: number, draft: JobDraft): boolean {
  return STEP_CHECKS[step]?.(draft) ?? true;
}

/** The route of the first builder step (1–5) whose data is incomplete, or null. */
export function firstIncompleteStep(draft: JobDraft): string | null {
  return firstIncompleteStepBefore(Object.keys(STEP_CHECKS).length + 1, draft);
}

/** The route of the first incomplete step before `step`, or null when every earlier step is done. */
export function firstIncompleteStepBefore(step: number, draft: JobDraft): string | null {
  const missing = POST_JOB_STEPS.find(
    (item) => item.step < step && item.step in STEP_CHECKS && !isStepComplete(item.step, draft),
  );
  return missing?.route ?? null;
}

export function stepRoute(step: number): string {
  return POST_JOB_STEPS.find((item) => item.step === step)?.route ?? POST_JOB_STEPS[0].route;
}

// Price

const roundCents = (value: number) => Math.round(value * 100) / 100;

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

/**
 * The estimated total: the fixed price, or rate × hours. Null until the
 * numbers needed are there.
 */
export function estimatedTotal(
  pricingType: PricingType | undefined,
  amount: number | undefined,
  hours: number | undefined,
): number | null {
  if (!isNumber(amount) || amount <= 0) return null;
  if (pricingType === "hourly") {
    return isNumber(hours) && hours > 0 ? roundCents(amount * hours) : null;
  }
  return roundCents(amount);
}

/** "$120" for whole dollars, "$120.50" otherwise. */
export function formatUsd(value: number): string {
  const whole = Number.isInteger(value);
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/** Parses a typed money amount ("40", "$1,200.50"); empty or invalid input is undefined. */
export function parseAmount(value: string | undefined): number | undefined {
  const cleaned = (value ?? "").replace(/[\s$,]/g, "");
  if (cleaned === "") return undefined;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

// Workers

/** "Jordan M." (decision 13). */
export function workerDisplayName(worker: Pick<WorkerSummary, "firstName" | "lastName">): string {
  const initial = worker.lastName.trim().charAt(0);
  return initial ? `${worker.firstName} ${initial.toUpperCase()}.` : worker.firstName;
}

export function workerInitials(worker: Pick<WorkerSummary, "firstName" | "lastName">): string {
  return `${worker.firstName.charAt(0)}${worker.lastName.charAt(0)}`.toUpperCase();
}

// Photos (object URLs; nothing is uploaded)

/** Revokes object URLs. Seed image paths are left alone. */
export function revokePhotoUrls(urls: readonly string[] | undefined): void {
  if (typeof URL === "undefined" || typeof URL.revokeObjectURL !== "function") return;
  urls?.forEach((url) => {
    if (url.startsWith("blob:")) URL.revokeObjectURL(url);
  });
}

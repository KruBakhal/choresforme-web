import { z } from "zod";

import { CATEGORIES, LIMITS, OTHER_SUB_SERVICE, VALIDATION_MESSAGES as M } from "@/lib/constants";
import {
  addressSchema,
  categoryIdSchema,
  descriptionSchema,
  emailSchema,
  isValidHours,
  isWithinPrice,
  optionalNumberSchema,
  photosSchema,
  pricingTypeSchema,
  templateNameSchema,
} from "@/lib/validation/fields";

/*
 * One schema per job builder step (T6, T7), plus `jobPostSchema`, which the
 * mock `jobs.create` uses to check a full draft. Cross-field rules run with
 * `when: always` so they show together with the other field errors.
 */

const always = () => true;

type Ctx = z.RefinementCtx;

// Shared cross-field rules (defensive: they also run when a field failed)

function refineServices(
  value: { category?: unknown; subServices?: unknown; otherText?: unknown },
  ctx: Ctx,
) {
  const subServices = Array.isArray(value.subServices) ? (value.subServices as unknown[]) : [];
  const category = CATEGORIES.find((item) => item.id === value.category);
  if (
    category &&
    subServices.some((s) => typeof s !== "string" || !category.subServices.includes(s))
  ) {
    ctx.addIssue({ code: "custom", path: ["subServices"], message: M.subServices });
  }
  if (subServices.includes(OTHER_SUB_SERVICE)) {
    const text = typeof value.otherText === "string" ? value.otherText.trim() : "";
    if (text.length < LIMITS.otherTextMin || text.length > LIMITS.otherTextMax) {
      ctx.addIssue({ code: "custom", path: ["otherText"], message: M.otherText });
    }
  }
}

function refinePricing(
  value: { pricingType?: unknown; amount?: number; hours?: number },
  ctx: Ctx,
) {
  if (value.pricingType === "hourly") {
    if (!isWithinPrice(value.amount, LIMITS.hourlyRateMin, LIMITS.hourlyRateMax)) {
      ctx.addIssue({ code: "custom", path: ["amount"], message: M.hourlyRate });
    }
    if (!isValidHours(value.hours)) {
      ctx.addIssue({ code: "custom", path: ["hours"], message: M.hours });
    }
    return;
  }
  if (!isWithinPrice(value.amount, LIMITS.fixedPriceMin, LIMITS.fixedPriceMax)) {
    ctx.addIssue({ code: "custom", path: ["amount"], message: M.fixedPrice });
  }
}

function refineMatch(value: { matchType?: unknown; workerId?: unknown }, ctx: Ctx) {
  if (value.matchType === "direct" && !(typeof value.workerId === "string" && value.workerId)) {
    ctx.addIssue({ code: "custom", path: ["workerId"], message: M.matchType });
  }
}

// Shapes

const servicesShape = {
  category: categoryIdSchema,
  subServices: z.array(z.string(), M.subServices).min(1, M.subServices),
  otherText: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined),
};

const detailsShape = {
  description: descriptionSchema,
  photos: photosSchema.optional(),
  pricingType: pricingTypeSchema.default("fixed"),
  amount: optionalNumberSchema,
  hours: optionalNumberSchema,
};

const matchShape = {
  matchType: z.enum(["board", "direct"], M.matchType),
  workerId: z.string().optional(),
};

// Step schemas

/** Step 1 Category: exactly one. */
export const categorySchema = z.object({ category: categoryIdSchema });

/** Step 2 Services: at least one; "Other" needs 3–100 characters of text. */
export const servicesSchema = z.object(servicesShape).superRefine(refineServices, { when: always });

/** Step 3 Where: a US address. */
export const locationSchema = z.object({ address: addressSchema });

/** Step 4 Details: description, photos and fixed or hourly pricing. */
export const detailsSchema = z.object(detailsShape).superRefine(refinePricing, { when: always });

/** Step 5 Who: Post to Job Board, or Pick a Worker with a worker selected. */
export const matchSchema = z.object(matchShape).superRefine(refineMatch, { when: always });

/** Step 3 "notify me" email capture for an address outside the service area. */
export const notifyMeSchema = z.object({ email: emailSchema });

/** Step 6 Review: the template name is required when Save As Template is ticked. */
export const reviewSchema = z
  .object({
    savedAsTemplate: z.boolean(),
    templateName: z.string().optional(),
  })
  .superRefine(
    (value, ctx) => {
      if (!value.savedAsTemplate) return;
      if (!templateNameSchema.safeParse(value.templateName ?? "").success) {
        ctx.addIssue({ code: "custom", path: ["templateName"], message: M.templateName });
      }
    },
    { when: always },
  );

/** A complete job draft, checked by `jobs.create` before it posts. */
export const jobPostSchema = z
  .object({
    ...servicesShape,
    address: addressSchema,
    ...detailsShape,
    ...matchShape,
    savedAsTemplate: z.boolean().default(false),
  })
  .superRefine(
    (value, ctx) => {
      refineServices(value, ctx);
      refinePricing(value, ctx);
      refineMatch(value, ctx);
    },
    { when: always },
  );

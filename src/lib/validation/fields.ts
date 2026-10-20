import { z } from "zod";

import {
  CATEGORY_IDS,
  DOCUMENT_MIME_TYPES,
  LIMITS,
  PHOTO_MIME_TYPES,
  US_STATES,
  VALIDATION_MESSAGES as M,
  type UsStateCode,
} from "@/lib/constants";

/*
 * Shared field rules (Tech Spec "Validation rules"). Every message comes from
 * VALIDATION_MESSAGES. Date rules read today's date at validation time, never
 * at module load or render.
 */

// Helpers

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parses 'YYYY-MM-DD' as a real calendar date (rejects 2023-02-30). */
export function parseIsoDate(value: string): { year: number; month: number; day: number } | null {
  const match = ISO_DATE.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

function todayParts(now = new Date()) {
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

/** True when the ISO date is a valid date and not after today. */
export function isValidPastDate(value: string): boolean {
  const date = parseIsoDate(value);
  if (!date) return false;
  const today = todayParts();
  if (date.year !== today.year) return date.year < today.year;
  if (date.month !== today.month) return date.month < today.month;
  return date.day <= today.day;
}

/** Whole years between the ISO date and today; null when the date is invalid. */
export function ageInYears(dob: string): number | null {
  const date = parseIsoDate(dob);
  if (!date) return null;
  const today = todayParts();
  let age = today.year - date.year;
  if (today.month < date.month || (today.month === date.month && today.day < date.day)) age -= 1;
  return age;
}

/** Removes the formatting people type in phone numbers: spaces, dashes, dots, brackets and "+". */
const stripPhoneFormatting = (value: string) => value.replace(/[\s().+-]/g, "");

/** Removes spaces and dashes from card, routing and account numbers. */
export const stripNumberFormatting = (value: string) => value.replace(/[\s-]/g, "");

/** Rounds away floating point noise, then checks for at most two decimals. */
const hasAtMostCents = (value: number) => Math.abs(Math.round(value * 100) - value * 100) < 1e-6;

export function isWithinPrice(value: number | undefined, min: number, max: number) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max &&
    hasAtMostCents(value)
  );
}

export function isValidHours(value: number | undefined) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= LIMITS.hoursMin &&
    value <= LIMITS.hoursMax &&
    Number.isInteger(value / LIMITS.hoursStep)
  );
}

export function isFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

const HEIC_EXTENSION = /\.(heic|heif)$/i;

function hasAllowedType(file: File, types: readonly string[]) {
  if (types.includes(file.type)) return true;
  // Some browsers report an empty type for HEIC photos.
  return types.includes("image/heic") && HEIC_EXTENSION.test(file.name);
}

type FileRule = {
  types: readonly string[];
  requiredMessage: string;
  typeMessage: string;
  sizeMessage: string;
};

function checkFile(value: unknown, rule: FileRule, ctx: z.RefinementCtx) {
  if (!isFile(value)) {
    ctx.addIssue({ code: "custom", message: rule.requiredMessage });
    return;
  }
  if (!hasAllowedType(value, rule.types)) {
    ctx.addIssue({ code: "custom", message: rule.typeMessage });
    return;
  }
  if (value.size > LIMITS.fileMaxBytes) {
    ctx.addIssue({ code: "custom", message: rule.sizeMessage });
  }
}

/** A required file. Upload screens hold File objects; nothing is sent anywhere. */
export function requiredFile(rule: FileRule) {
  return z
    .unknown()
    .superRefine((value, ctx) => checkFile(value, rule, ctx))
    .transform((value) => value as File);
}

/** An optional file: empty is fine, anything else must pass the file rule. */
export function optionalFile(rule: FileRule) {
  return z
    .unknown()
    .superRefine((value, ctx) => {
      if (value === undefined || value === null) return;
      checkFile(value, rule, ctx);
    })
    .transform((value) => (isFile(value) ? value : undefined))
    .optional();
}

export const PHOTO_FILE_RULE: FileRule = {
  types: PHOTO_MIME_TYPES,
  requiredMessage: M.photoType,
  typeMessage: M.photoType,
  sizeMessage: M.photoSize,
};

export const DOCUMENT_FILE_RULE: FileRule = {
  types: DOCUMENT_MIME_TYPES,
  requiredMessage: M.insurance,
  typeMessage: M.insurance,
  sizeMessage: M.insurance,
};

// People

const NAME_PATTERN = /^\p{L}[\p{L} '’-]*$/u;

export const firstNameSchema = z
  .string(M.firstName)
  .trim()
  .min(1, M.firstName)
  .max(LIMITS.nameMax, M.firstName)
  .regex(NAME_PATTERN, M.firstName);

export const lastNameSchema = z
  .string(M.lastName)
  .trim()
  .min(1, M.lastName)
  .max(LIMITS.nameMax, M.lastName)
  .regex(NAME_PATTERN, M.lastName);

export const emailSchema = z.string(M.email).trim().pipe(z.email(M.email));

export const passwordSchema = z
  .string(M.password)
  .min(LIMITS.passwordMin, M.password)
  .regex(/[A-Za-z]/, M.password)
  .regex(/\d/, M.password);

/** 10 digits in (formatting and a leading 1 are allowed), +1XXXXXXXXXX out. */
export const mobileSchema = z
  .string(M.mobile)
  .trim()
  .transform(stripPhoneFormatting)
  .pipe(z.string().regex(/^1?\d{10}$/, M.mobile))
  .transform((digits) => `+1${digits.slice(-10)}`);

export const otpCodeSchema = z
  .string(M.otp)
  .trim()
  .regex(/^\d{6}$/, M.otp);

/** ISO date ('YYYY-MM-DD'), valid and not in the future. The 18+ rule is role aware (sign-up). */
export const dobSchema = z
  .string(M.dob)
  .trim()
  .refine((value) => isValidPastDate(value), M.dob);

export const termsSchema = z.boolean(M.terms).refine((value) => value, M.terms);

// Address (US only)

const STATE_CODES = US_STATES.map((state) => state.code) as [UsStateCode, ...UsStateCode[]];

export const usStateSchema = z.enum(STATE_CODES, M.state);

export const zipSchema = z
  .string(M.zip)
  .trim()
  .regex(/^\d{5}$/, M.zip);

export const addressSchema = z.object({
  line1: z
    .string(M.addressLine1)
    .trim()
    .min(LIMITS.addressLine1Min, M.addressLine1)
    .max(LIMITS.addressLine1Max, M.addressLine1),
  city: z.string(M.city).trim().min(1, M.city),
  state: usStateSchema,
  zip: zipSchema,
  landmark: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined),
});

// Job

export const categoryIdSchema = z.enum(CATEGORY_IDS, M.category);

export const descriptionSchema = z
  .string(M.description)
  .trim()
  .min(LIMITS.descriptionMin, M.description)
  .max(LIMITS.descriptionMax, M.description);

export const photosSchema = z.array(z.string()).max(LIMITS.photosMax, M.photosMax);

export const photoFileSchema = requiredFile(PHOTO_FILE_RULE);

export const pricingTypeSchema = z.enum(["fixed", "hourly"]);

/** Money and hours arrive as numbers (or NaN from an empty input); bad values become undefined. */
export const optionalNumberSchema = z.number().optional().catch(undefined);

export const templateNameSchema = z
  .string(M.templateName)
  .trim()
  .min(LIMITS.templateNameMin, M.templateName)
  .max(LIMITS.templateNameMax, M.templateName);

// Worker

export const radiusSchema = z
  .number(M.radius)
  .min(LIMITS.radiusMin, M.radius)
  .max(LIMITS.radiusMax, M.radius);

export const workerCategoriesSchema = z
  .array(categoryIdSchema, M.workerCategories)
  .min(1, M.workerCategories);

export const routingNumberSchema = z
  .string(M.routingNumber)
  .trim()
  .transform(stripNumberFormatting)
  .pipe(z.string().regex(/^\d{9}$/, M.routingNumber));

export const accountNumberSchema = z
  .string(M.accountNumber)
  .trim()
  .transform(stripNumberFormatting)
  .pipe(z.string().regex(/^\d{4,17}$/, M.accountNumber));

/** Star rating used by `jobs.rate`: an integer from 1 to 5. */
export const ratingSchema = z.number().int().min(LIMITS.ratingMin).max(LIMITS.ratingMax);

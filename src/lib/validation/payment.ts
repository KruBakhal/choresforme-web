import { z } from "zod";

import { VALIDATION_MESSAGES as M } from "@/lib/constants";
import type { CardBrand } from "@/lib/types";
import { stripNumberFormatting } from "@/lib/validation/fields";

/** Card brand by prefix: 4 Visa, 51–55 or 2221–2720 Mastercard, 34/37 Amex (decision 18). */
export function detectCardBrand(digits: string): CardBrand | null {
  if (/^4/.test(digits)) return "visa";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^5[1-5]/.test(digits)) return "mastercard";
  const firstFour = Number(digits.slice(0, 4));
  if (digits.length >= 4 && firstFour >= 2221 && firstFour <= 2720) return "mastercard";
  return null;
}

/** 15 digits for Amex, 16 for Visa and Mastercard. */
export function isValidCardNumber(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false;
  const brand = detectCardBrand(digits);
  if (!brand) return false;
  return digits.length === (brand === "amex" ? 15 : 16);
}

const EXPIRY = /^(0[1-9]|1[0-2])\s*\/\s*(\d{2})$/;

/** MM/YY, valid through the last day of that month. */
export function isValidExpiry(value: string): boolean {
  const match = EXPIRY.exec(value.trim());
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return year > currentYear || (year === currentYear && month >= currentMonth);
}

/** Card form (Step 7). UI only: `payments.addMethod` keeps just the brand and last 4. */
export const cardSchema = z
  .object({
    number: z
      .string(M.cardNumber)
      .transform(stripNumberFormatting)
      .refine(isValidCardNumber, M.cardNumber),
    expiry: z.string(M.expiry).trim().refine(isValidExpiry, M.expiry),
    cvc: z
      .string(M.cvc)
      .trim()
      .regex(/^\d{3,4}$/, M.cvc),
  })
  .superRefine((value, ctx) => {
    // The CVC length depends on the brand; only checked once the CVC itself is 3–4 digits.
    if (typeof value.cvc !== "string" || !/^\d{3,4}$/.test(value.cvc)) return;
    const brand = typeof value.number === "string" ? detectCardBrand(value.number) : null;
    const expected = brand === "amex" ? 4 : 3;
    if (value.cvc.length !== expected) {
      ctx.addIssue({ code: "custom", path: ["cvc"], message: M.cvc });
    }
  });

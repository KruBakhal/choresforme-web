import type { FieldErrors, FieldValues, Resolver, ResolverResult } from "react-hook-form";
import type { z } from "zod";

import { VALIDATION_MESSAGES } from "@/lib/constants";
import { zodResolver } from "@/lib/validation";

/** Form values that carry the inline OTP result next to the schema's fields. */
export type WithMobileVerified<T> = T & { mobileVerified: boolean };

/**
 * The schema's resolver plus the form-level "mobile verified" check (T5
 * decision 1): a valid but unverified mobile gets "Verify your mobile
 * number". `mobileVerified` is not part of the schema and is stripped from
 * the submitted values.
 */
export function mobileVerifiedResolver<TInput extends FieldValues, TOutput extends FieldValues>(
  schema: z.ZodType<TOutput, TInput>,
): Resolver<WithMobileVerified<TInput>, unknown, TOutput> {
  type Values = WithMobileVerified<TInput>;
  type Result = ResolverResult<Values, TOutput>;
  const base = zodResolver(schema);
  return async (values, context, options) => {
    const result = (await base(values, context, options as never)) as Result;
    if (values.mobileVerified || result.errors.mobile) return result;
    const errors = {
      ...result.errors,
      mobile: { type: "custom", message: VALIDATION_MESSAGES.mobileUnverified },
    } as FieldErrors<Values>;
    return { values: {}, errors };
  };
}

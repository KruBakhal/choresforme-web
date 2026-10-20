import { get, set, type FieldErrors, type FieldValues, type Resolver } from "react-hook-form";
import type { z } from "zod";

/**
 * Hand-written Zod resolver for React Hook Form (no @hookform/resolvers).
 * Runs the schema and maps each issue to `FieldErrors` by its path, nested
 * paths included. The first issue per field wins. Issues without a path go
 * to `errors.root`.
 *
 * Forms use `mode: "onBlur"` and RHF's default `shouldFocusError`, so errors
 * show on blur and on submit and the first invalid field gets focus.
 */
export function zodResolver<TInput extends FieldValues, TOutput extends FieldValues>(
  schema: z.ZodType<TOutput, TInput>,
): Resolver<TInput, unknown, TOutput> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const errors: FieldErrors<TInput> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.filter((key) => typeof key !== "symbol").join(".") || "root";
      if (get(errors, path)) continue;
      set(errors, path, { type: issue.code, message: issue.message });
    }
    return { values: {}, errors };
  };
}

import { z } from "zod";

import { LIMITS, VALIDATION_MESSAGES as M } from "@/lib/constants";
import {
  ageInYears,
  dobSchema,
  emailSchema,
  firstNameSchema,
  lastNameSchema,
  mobileSchema,
  otpCodeSchema,
  passwordSchema,
  termsSchema,
} from "@/lib/validation/fields";

const always = () => true;

/** Email sign-up (customer or worker). Workers must be 18 or older. */
export const signUpSchema = z
  .object({
    role: z.enum(["customer", "worker"]),
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    email: emailSchema,
    password: passwordSchema,
    mobile: mobileSchema,
    dob: dobSchema,
    terms: termsSchema,
  })
  .superRefine(
    (value, ctx) => {
      if (value.role !== "worker" || typeof value.dob !== "string") return;
      const age = ageInYears(value.dob.trim());
      if (age !== null && age >= 0 && age < LIMITS.workerMinAge) {
        ctx.addIssue({ code: "custom", path: ["dob"], message: M.dobUnder18 });
      }
    },
    // Run with the other field errors so every error shows on the first submit.
    { when: always },
  );

/** Login: any password works in the demo, so it only has to be filled in (decision 16). */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string(M.loginPassword).min(1, M.loginPassword),
});

export const otpSchema = z.object({
  code: otpCodeSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/** Completes a new Google or Facebook user: mobile, date of birth and Terms (decision 9). */
export const completeProfileSchema = z
  .object({
    role: z.enum(["customer", "worker"]),
    mobile: mobileSchema,
    dob: dobSchema,
    terms: termsSchema,
  })
  .superRefine(
    (value, ctx) => {
      if (value.role !== "worker" || typeof value.dob !== "string") return;
      const age = ageInYears(value.dob.trim());
      if (age !== null && age >= 0 && age < LIMITS.workerMinAge) {
        ctx.addIssue({ code: "custom", path: ["dob"], message: M.dobUnder18 });
      }
    },
    { when: always },
  );

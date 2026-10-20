import { z } from "zod";

import { PHOTO_MIME_TYPES, VALIDATION_MESSAGES as M } from "@/lib/constants";
import {
  accountNumberSchema,
  addressSchema,
  DOCUMENT_FILE_RULE,
  optionalFile,
  PHOTO_FILE_RULE,
  radiusSchema,
  requiredFile,
  routingNumberSchema,
  workerCategoriesSchema,
} from "@/lib/validation/fields";

/* Worker onboarding (T9). Files stay in the browser; nothing is uploaded. */

/** Your area (1/4): base address and a 5–200 mile radius. */
export const workerAreaSchema = z.object({
  baseAddress: addressSchema,
  radiusMiles: radiusSchema,
});

/** Your services (2/4): at least one category. */
export const workerServicesSchema = z.object({
  categories: workerCategoriesSchema,
});

const idPhotoRule = (message: string) => ({
  types: PHOTO_MIME_TYPES,
  requiredMessage: message,
  typeMessage: message,
  sizeMessage: message,
});

/** Verify ID (3/4): front and back required; the profile photo is optional here (decision 19). */
export const idDocumentsSchema = z.object({
  idFront: requiredFile(idPhotoRule(M.idFront)),
  idBack: requiredFile(idPhotoRule(M.idBack)),
  profilePhoto: optionalFile(PHOTO_FILE_RULE),
});

/** Insurance (4/4): one image or PDF up to 10 MB. */
export const insuranceSchema = z.object({
  document: requiredFile(DOCUMENT_FILE_RULE),
});

/** Payout account: 9-digit routing number and a 4–17 digit account number. */
export const payoutSchema = z.object({
  routingNumber: routingNumberSchema,
  accountNumber: accountNumberSchema,
});

/** Single-file checks for `workers.uploadDocument`, by document kind. */
export const documentFileSchemas = {
  id_front: requiredFile(idPhotoRule(M.idFront)),
  id_back: requiredFile(idPhotoRule(M.idBack)),
  insurance: requiredFile(DOCUMENT_FILE_RULE),
} as const;

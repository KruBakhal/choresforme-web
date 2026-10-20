import type { cardSchema, signUpSchema } from "@/lib/validation";
import type { z } from "zod";

/*
 * Domain types. Everything from `Role` to `PaymentMethod` is copied verbatim
 * from the Tech Spec "Data model" and mirrors the Android apps' fields.
 * The types below that block support the mock services, stores and analytics.
 */

// Tech Spec "Data model" (verbatim)

export type Role = "customer" | "worker";

export type CategoryId = "outdoor" | "cleaning" | "disposal" | "custom";

export interface Category {
  id: CategoryId;
  name: string; // 'Outdoor Home Service' | 'House Cleaning' | 'Item Disposal' | 'Custom'
  subServices: string[]; // e.g. outdoor: Lawn Mowing, Weed Removal, Planting, Gutter Service, Other
}

export interface User {
  id: string;
  role: Role;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string; // E.164, +1 only
  phoneVerified: boolean;
  dob: string; // ISO date, required for both roles
  photoUrl?: string;
  authProvider: "email" | "google" | "facebook";
  createdAt: string;
}

export type VerificationStatus = "not_started" | "under_review" | "verified" | "rejected";

export interface WorkerProfile {
  userId: string;
  baseAddress: Address;
  radiusMiles: number; // 5 to 200
  categories: CategoryId[];
  idStatus: VerificationStatus;
  insuranceStatus: VerificationStatus;
  payoutAdded: boolean;
  rating: number; // 0 to 5
  jobsCompleted: number;
  rejectionReason?: string;
}

export interface Address {
  line1: string;
  city: string;
  state: string; // US state code, e.g. 'TX'
  zip: string; // 5 digits
  landmark?: string;
}

export type PricingType = "fixed" | "hourly";

export type JobStatus = "open" | "accepted" | "in_progress" | "completed" | "cancelled";

export interface Job {
  id: string;
  customerId: string;
  category: CategoryId;
  subServices: string[];
  otherText?: string;
  address: Address;
  description: string;
  photos: string[]; // object URLs or seed image paths
  pricingType: PricingType;
  amount: number; // USD; fixed total or hourly rate
  hours?: number; // required when hourly, 1 to 12
  matchType: "board" | "direct";
  workerId?: string; // set when direct or accepted
  status: JobStatus;
  savedAsTemplate: boolean;
  createdAt: string;
  completedAt?: string;
  customerRating?: number;
}

export type JobDraft = Partial<Omit<Job, "id" | "customerId" | "status" | "createdAt">> & {
  lastStep: number;
};

export interface Template {
  id: string;
  customerId: string;
  name: string;
  job: JobDraft;
}

export interface PaymentMethod {
  id: string;
  brand: "visa" | "mastercard" | "amex";
  last4: string;
}

// Types referenced by the service signatures (T3 product plan, decision 2)

export type AuthProvider = User["authProvider"];
export type SocialProvider = Exclude<AuthProvider, "email">;
export type MatchType = Job["matchType"];
export type CardBrand = PaymentMethod["brand"];

/** What Step 5 and Favourites show: name, rating and ID-Card badges. */
export type WorkerSummary = Pick<
  User,
  "id" | "firstName" | "lastName" | "photoUrl" | "phoneVerified"
> &
  Pick<WorkerProfile, "rating" | "jobsCompleted" | "idStatus" | "insuranceStatus">;

/** Output of the sign-up schema (mobile already normalised to +1XXXXXXXXXX). */
export type SignUpInput = z.infer<typeof signUpSchema>;

/** Output of the card schema (number with spaces removed). */
export type CardInput = z.infer<typeof cardSchema>;

export type DocumentKind = "id_front" | "id_back" | "insurance";

/** A board job with the mock distance from the worker's base address (decision 10). */
export type BoardJob = Job & { distanceMiles: number };

/** Fields a user can change on their own account. */
export type UserPatch = Partial<Omit<User, "id" | "role" | "createdAt">>;

/** Fields a customer can change before the job is accepted. */
export type JobPatch = Partial<
  Pick<
    Job,
    | "subServices"
    | "otherText"
    | "address"
    | "description"
    | "photos"
    | "pricingType"
    | "amount"
    | "hours"
  >
>;

export interface EarningsPayout {
  jobId: string;
  category: CategoryId;
  amount: number;
  completedAt: string;
}

/** Derived from the worker's completed jobs (decision 17). */
export interface EarningsSummary {
  workerId: string;
  totalEarned: number;
  completedJobs: number;
  payouts: EarningsPayout[];
}

/** "Notify me" capture for addresses outside the service area. */
export interface NotifyRequest {
  email: string;
  address: Address;
  createdAt: string;
}

// Session and stores

export interface Session {
  user: User;
  /** ISO timestamp; an expired session counts as logged out. */
  expiresAt: string;
}

export type OnboardingStep = "area" | "services" | "id" | "insurance" | "payout";

export interface OnboardingProgress {
  completedSteps: OnboardingStep[];
  currentStep: OnboardingStep;
}

// Service errors

export type ServiceErrorCode =
  | "MOCK_ERROR"
  | "NO_ACCOUNT"
  | "ACCOUNT_EXISTS"
  | "JOB_NOT_FOUND"
  | "JOB_TAKEN"
  | "NOT_VERIFIED"
  | "NOT_ALLOWED"
  | "SIGN_IN_REQUIRED"
  | "CARD_FAILED"
  | "UPLOAD_FAILED"
  | "INVALID_INPUT"
  /** Social sign-in: the identity's account has the other role (T5 decision 2). */
  | "ROLE_MISMATCH"
  /** Social sign-in: a new identity needs a role before an account is created (T5 decision 3). */
  | "ROLE_REQUIRED";

// Dev-only seed check (decision 13)

export interface SeedCounts {
  categories: number;
  customers: number;
  workers: number;
  jobs: number;
  templates: number;
  paymentMethods: number;
  workersByStatus: Record<VerificationStatus, number>;
  jobsByStatus: Record<JobStatus, number>;
}

export interface SeedSummary {
  current: SeedCounts;
  expected: SeedCounts;
}

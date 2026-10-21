import type { z } from "zod";

import {
  DEMO_OTP_CODE,
  DEMO_SOCIAL_IDENTITIES,
  JOB_STATUSES,
  LIMITS,
  SERVICE_MESSAGES,
  VERIFICATION_STATUSES,
} from "@/lib/constants";
import { createSeedDb, readDb, resetDb, updateDb, type MockDb } from "@/lib/mock/db";
import { runService } from "@/lib/mock/runtime";
import { ServiceError } from "@/lib/mock/service-error";
import { clearStores, hydrateStores, isSessionActive, useSessionStore } from "@/lib/store";
import type {
  Address,
  BoardJob,
  CardInput,
  CategoryId,
  DocumentKind,
  EarningsSummary,
  Job,
  JobDraft,
  JobPatch,
  PaymentMethod,
  Role,
  SeedCounts,
  SeedSummary,
  ServiceErrorCode,
  SignUpInput,
  SocialProvider,
  Template,
  User,
  UserPatch,
  VerificationStatus,
  WorkerProfile,
  WorkerSummary,
} from "@/lib/types";
import {
  addressSchema,
  cardSchema,
  detectCardBrand,
  documentFileSchemas,
  dobSchema,
  emailSchema,
  firstNameSchema,
  jobPostSchema,
  lastNameSchema,
  loginSchema,
  mobileSchema,
  radiusSchema,
  ratingSchema,
  signUpSchema,
  templateNameSchema,
  workerCategoriesSchema,
} from "@/lib/validation";

/*
 * lib/mock/services.ts — the only data entry point for UI code (Tech Spec
 * "Mock service layer and mock auth"). Every call resolves or rejects after
 * a 400–800 ms delay; `?mockError=1` makes the first call after the page loads
 * reject. Rejections are `ServiceError`s with a code and the message to show.
 * Swapping to HTTP later only touches src/lib/mock.
 */

export { isServiceError, ServiceError } from "@/lib/mock/service-error";

// Helpers (internal)

function fail(code: ServiceErrorCode, message: string): never {
  throw new ServiceError(code, message);
}

function parseOrFail<S extends z.ZodType>(
  schema: S,
  value: unknown,
  code: ServiceErrorCode,
  message?: string,
): z.output<S> {
  const result = schema.safeParse(value);
  if (!result.success) fail(code, message ?? result.error.issues[0]?.message ?? code);
  return result.data;
}

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

const sameEmail = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

function findUserByEmail(db: MockDb, email: string): User | undefined {
  return db.users.find((user) => sameEmail(user.email, email));
}

function requireUser(db: MockDb, userId: string): User {
  return (
    db.users.find((user) => user.id === userId) ?? fail("NO_ACCOUNT", SERVICE_MESSAGES.noAccount)
  );
}

function requireWorkerProfile(db: MockDb, userId: string): WorkerProfile {
  return (
    db.workerProfiles.find((profile) => profile.userId === userId) ??
    fail("NO_ACCOUNT", SERVICE_MESSAGES.noAccount)
  );
}

function requireJob(db: MockDb, jobId: string): Job {
  return (
    db.jobs.find((job) => job.id === jobId) ?? fail("JOB_NOT_FOUND", SERVICE_MESSAGES.jobNotFound)
  );
}

function isVerified(profile: WorkerProfile): boolean {
  return profile.idStatus === "verified" && profile.insuranceStatus === "verified";
}

/** One status per worker: rejected beats under review beats verified (both documents). */
function overallStatus(profile: WorkerProfile): VerificationStatus {
  const statuses = [profile.idStatus, profile.insuranceStatus];
  if (statuses.includes("rejected")) return "rejected";
  if (isVerified(profile)) return "verified";
  if (statuses.includes("under_review")) return "under_review";
  return "not_started";
}

function toWorkerSummary(user: User, profile: WorkerProfile): WorkerSummary {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    photoUrl: user.photoUrl,
    phoneVerified: user.phoneVerified,
    rating: profile.rating,
    jobsCompleted: profile.jobsCompleted,
    idStatus: profile.idStatus,
    insuranceStatus: profile.insuranceStatus,
  };
}

function hash(text: string): number {
  let value = 0;
  for (let i = 0; i < text.length; i += 1) value = (value * 31 + text.charCodeAt(i)) >>> 0;
  return value;
}

/**
 * Mock distance in miles (decision 10). `Address` has no coordinates, so it
 * is derived from the ZIP codes: nearby ZIPs are a few miles apart, other
 * areas 150+ miles. Stable for the same pair.
 */
function mockDistanceMiles(zipA: string, zipB: string, pairKey: string): number {
  const diff = Math.abs(Number(zipA) - Number(zipB));
  const base = diff < 100 ? 1 + diff * 0.4 : 150 + (diff % 50);
  const jitter = (hash(pairKey) % 10) / 10;
  return Math.round((base + jitter) * 10) / 10;
}

function isInArea(profile: WorkerProfile, address: Address, pairKey: string): number | null {
  if (profile.baseAddress.state !== address.state) return null;
  const distance = mockDistanceMiles(profile.baseAddress.zip, address.zip, pairKey);
  return distance <= profile.radiusMiles ? distance : null;
}

const newestFirst = (a: { createdAt: string }, b: { createdAt: string }) =>
  b.createdAt.localeCompare(a.createdAt);

const roundCents = (value: number) => Math.round(value * 100) / 100;

function jobTotal(job: Job): number {
  return roundCents(job.pricingType === "hourly" ? job.amount * (job.hours ?? 0) : job.amount);
}

function emptyWorkerProfile(userId: string): WorkerProfile {
  return {
    userId,
    baseAddress: { line1: "", city: "", state: "", zip: "" },
    radiusMiles: LIMITS.radiusDefault,
    categories: [],
    idStatus: "not_started",
    insuranceStatus: "not_started",
    payoutAdded: false,
    rating: 0,
    jobsCompleted: 0,
  };
}

function addUser(db: MockDb, user: User): void {
  db.users.push(user);
  if (user.role === "worker") db.workerProfiles.push(emptyWorkerProfile(user.id));
}

/** True when this mobile (+1XXXXXXXXXX) passed the SMS code check on this device. */
function isMobileVerified(db: MockDb, mobile: string): boolean {
  return (db.verifiedMobiles ?? []).includes(mobile);
}

/** Starts a 30-day session on this device. */
async function startSession(user: User): Promise<void> {
  await hydrateStores();
  const expiresAt = new Date(Date.now() + LIMITS.sessionDays * 24 * 60 * 60 * 1000).toISOString();
  useSessionStore.getState().setSession({ user: structuredClone(user), expiresAt });
}

async function sessionUser(): Promise<User | null> {
  await hydrateStores();
  const { session } = useSessionStore.getState();
  return isSessionActive(session) ? session.user : null;
}

async function syncSessionUser(user: User): Promise<void> {
  const current = await sessionUser();
  if (current?.id === user.id) useSessionStore.getState().updateUser(structuredClone(user));
}

// auth

export const auth = {
  /**
   * Creates the account and signs in. Any existing email rejects with "You
   * already have an account — log in". The mobile counts as verified when it
   * passed `verifyOtp` first (T5 decision 1).
   */
  signUp(input: SignUpInput): Promise<User> {
    return runService(async () => {
      const data = parseOrFail(signUpSchema, input, "INVALID_INPUT");
      const user = updateDb((db) => {
        if (findUserByEmail(db, data.email)) fail("ACCOUNT_EXISTS", SERVICE_MESSAGES.accountExists);
        const created: User = {
          id: newId("usr"),
          role: data.role,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          mobile: data.mobile,
          phoneVerified: isMobileVerified(db, data.mobile),
          dob: data.dob,
          authProvider: "email",
          createdAt: nowIso(),
        };
        addUser(db, created);
        return created;
      });
      await startSession(user);
      return user;
    });
  },

  /** Any account in the mock DB with any password signs in; an unknown email rejects with "No account found". */
  login(email: string, password: string): Promise<User> {
    return runService(async () => {
      const data = parseOrFail(loginSchema, { email, password }, "INVALID_INPUT");
      const user =
        findUserByEmail(readDb(), data.email) ?? fail("NO_ACCOUNT", SERVICE_MESSAGES.noAccount);
      await startSession(user);
      return user;
    });
  },

  /**
   * Demo Google / Facebook sign-in with the prefilled demo identity. A new
   * user comes back with an empty `mobile` and `dob` and `phoneVerified:
   * false`; the UI completes them with `users.update` (decision 9).
   *
   * `role` is optional (T5 decisions 2 and 3): an existing account whose role
   * differs from `role` rejects with `ROLE_MISMATCH`, and a new identity
   * without a role rejects with `ROLE_REQUIRED`. Neither starts a session.
   */
  loginWithProvider(provider: SocialProvider, role?: Role): Promise<User> {
    return runService(async () => {
      const identity = DEMO_SOCIAL_IDENTITIES[provider];
      const user = updateDb((db) => {
        const existing = findUserByEmail(db, identity.email);
        if (existing) {
          if (role && existing.role !== role) {
            fail("ROLE_MISMATCH", SERVICE_MESSAGES.roleMismatch);
          }
          return existing;
        }
        if (!role) fail("ROLE_REQUIRED", SERVICE_MESSAGES.roleRequired);
        const created: User = {
          id: newId("usr"),
          role,
          firstName: identity.firstName,
          lastName: identity.lastName,
          email: identity.email,
          mobile: "",
          phoneVerified: false,
          dob: "",
          authProvider: provider,
          createdAt: nowIso(),
        };
        addUser(db, created);
        return created;
      });
      await startSession(user);
      return user;
    });
  },

  sendOtp(mobile: string): Promise<void> {
    return runService(() => {
      parseOrFail(mobileSchema, mobile, "INVALID_INPUT");
    });
  },

  /**
   * `true` for 123456, `false` for any other code. A match records the mobile
   * as verified on this device, with or without a session (T5 decision 1), and
   * marks the signed-in user's mobile as verified when it is theirs.
   */
  verifyOtp(mobile: string, code: string): Promise<boolean> {
    return runService(async () => {
      if (code.trim() !== DEMO_OTP_CODE) return false;
      const normalised = mobileSchema.safeParse(mobile);
      if (normalised.success) {
        updateDb((db) => {
          if (!isMobileVerified(db, normalised.data)) {
            db.verifiedMobiles = [...(db.verifiedMobiles ?? []), normalised.data];
          }
        });
      }
      const current = await sessionUser();
      if (normalised.success && current && current.mobile === normalised.data) {
        const updated = updateDb((db) => {
          const user = requireUser(db, current.id);
          user.phoneVerified = true;
          return user;
        });
        await syncSessionUser(updated);
      }
      return true;
    });
  },

  /** Always resolves (the "Check your email" screen). */
  requestPasswordReset(email: string): Promise<void> {
    void email;
    return runService(() => undefined);
  },

  /** Clears the session; the mock data stays. */
  logout(): Promise<void> {
    return runService(async () => {
      await hydrateStores();
      useSessionStore.getState().clear();
    });
  },
};

// jobs

export const jobs = {
  listForCustomer(customerId: string): Promise<Job[]> {
    return runService(() =>
      readDb()
        .jobs.filter((job) => job.customerId === customerId)
        .sort(newestFirst),
    );
  },

  /** Open board jobs in the worker's state, categories and radius, with the mock distance. */
  listBoard(workerId: string): Promise<BoardJob[]> {
    return runService(() => {
      const db = readDb();
      const profile = requireWorkerProfile(db, workerId);
      return db.jobs
        .filter(
          (job) =>
            job.status === "open" &&
            job.matchType === "board" &&
            profile.categories.includes(job.category),
        )
        .flatMap((job) => {
          const distanceMiles = isInArea(profile, job.address, `${job.id}:${workerId}`);
          return distanceMiles === null ? [] : [{ ...job, distanceMiles }];
        })
        .sort(newestFirst);
    });
  },

  /** My Jobs: every job assigned to the worker. */
  listForWorker(workerId: string): Promise<Job[]> {
    return runService(() =>
      readDb()
        .jobs.filter((job) => job.workerId === workerId)
        .sort(newestFirst),
    );
  },

  get(id: string): Promise<Job> {
    return runService(() => requireJob(readDb(), id));
  },

  /**
   * Posts the draft for the signed-in customer. Board jobs are `open` and show
   * on matching boards; Pick a Worker jobs are `accepted` with `workerId` set
   * and never show on the board (decision 11).
   */
  create(draft: JobDraft): Promise<Job> {
    return runService(async () => {
      const customer = await sessionUser();
      if (!customer || customer.role !== "customer") {
        fail("SIGN_IN_REQUIRED", SERVICE_MESSAGES.signInRequired);
      }
      const data = parseOrFail(jobPostSchema, draft, "INVALID_INPUT");
      return updateDb((db) => {
        if (data.matchType === "direct") {
          const profile = requireWorkerProfile(db, data.workerId ?? "");
          if (!isVerified(profile)) fail("NOT_VERIFIED", SERVICE_MESSAGES.notVerified);
        }
        const job: Job = {
          id: newId("job"),
          customerId: customer.id,
          category: data.category,
          subServices: data.subServices,
          otherText: data.otherText,
          address: data.address,
          description: data.description,
          photos: data.photos ?? [],
          pricingType: data.pricingType,
          amount: data.amount ?? 0,
          hours: data.pricingType === "hourly" ? data.hours : undefined,
          matchType: data.matchType,
          workerId: data.matchType === "direct" ? data.workerId : undefined,
          status: data.matchType === "direct" ? "accepted" : "open",
          savedAsTemplate: data.savedAsTemplate,
          createdAt: nowIso(),
        };
        db.jobs.push(job);
        return job;
      });
    });
  },

  /** First come, first served: a job that is no longer open rejects with "This job was just taken". */
  accept(jobId: string, workerId: string): Promise<Job> {
    return runService(() =>
      updateDb((db) => {
        const job = requireJob(db, jobId);
        const profile = requireWorkerProfile(db, workerId);
        if (!isVerified(profile)) fail("NOT_VERIFIED", SERVICE_MESSAGES.notVerified);
        if (job.status !== "open") fail("JOB_TAKEN", SERVICE_MESSAGES.jobTaken);
        job.status = "accepted";
        job.workerId = workerId;
        return job;
      }),
    );
  },

  /** Open and accepted jobs only. */
  cancel(jobId: string): Promise<Job> {
    return runService(() =>
      updateDb((db) => {
        const job = requireJob(db, jobId);
        if (job.status !== "open" && job.status !== "accepted") {
          fail("NOT_ALLOWED", SERVICE_MESSAGES.notAllowed);
        }
        job.status = "cancelled";
        return job;
      }),
    );
  },

  /** 1–5 whole stars, completed jobs only, once. Updates the worker's running average. */
  rate(jobId: string, stars: number): Promise<Job> {
    return runService(() =>
      updateDb((db) => {
        const value = parseOrFail(
          ratingSchema,
          stars,
          "INVALID_INPUT",
          SERVICE_MESSAGES.notAllowed,
        );
        const job = requireJob(db, jobId);
        if (job.status !== "completed" || job.customerRating !== undefined) {
          fail("NOT_ALLOWED", SERVICE_MESSAGES.notAllowed);
        }
        job.customerRating = value;
        const profile = job.workerId
          ? db.workerProfiles.find((item) => item.userId === job.workerId)
          : undefined;
        if (profile) {
          const count = Math.max(profile.jobsCompleted, 1);
          profile.rating = roundCents((profile.rating * (count - 1) + value) / count);
        }
        return job;
      }),
    );
  },

  /** Accepted → in progress. */
  start(jobId: string): Promise<Job> {
    return runService(() =>
      updateDb((db) => {
        const job = requireJob(db, jobId);
        if (job.status !== "accepted") fail("NOT_ALLOWED", SERVICE_MESSAGES.notAllowed);
        job.status = "in_progress";
        return job;
      }),
    );
  },

  /** In progress → completed. The customer is charged on completion (no refunds). */
  complete(jobId: string): Promise<Job> {
    return runService(() =>
      updateDb((db) => {
        const job = requireJob(db, jobId);
        if (job.status !== "in_progress") fail("NOT_ALLOWED", SERVICE_MESSAGES.notAllowed);
        job.status = "completed";
        job.completedAt = nowIso();
        const profile = db.workerProfiles.find((item) => item.userId === job.workerId);
        if (profile) profile.jobsCompleted += 1;
        return job;
      }),
    );
  },

  /** Edits a job before it is accepted (open jobs only). */
  update(jobId: string, patch: JobPatch): Promise<Job> {
    return runService(() =>
      updateDb((db) => {
        const job = requireJob(db, jobId);
        if (job.status !== "open") fail("NOT_ALLOWED", SERVICE_MESSAGES.notAllowed);
        const data = parseOrFail(jobPostSchema, { ...job, ...patch }, "INVALID_INPUT");
        Object.assign(job, {
          subServices: data.subServices,
          otherText: data.otherText,
          address: data.address,
          description: data.description,
          photos: data.photos ?? [],
          pricingType: data.pricingType,
          amount: data.amount ?? job.amount,
          hours: data.pricingType === "hourly" ? data.hours : undefined,
        } satisfies Partial<Job>);
        return job;
      }),
    );
  },
};

// workers

export const workers = {
  /** Verified workers serving the category whose area covers the address. */
  listForArea(address: Address, category: CategoryId): Promise<WorkerSummary[]> {
    return runService(() => {
      const target = parseOrFail(addressSchema, address, "INVALID_INPUT");
      const db = readDb();
      return db.workerProfiles
        .filter(
          (profile) =>
            isVerified(profile) &&
            profile.categories.includes(category) &&
            isInArea(profile, target, `${profile.userId}:${target.zip}`) !== null,
        )
        .flatMap((profile) => {
          const user = db.users.find((item) => item.id === profile.userId);
          return user ? [toWorkerSummary(user, profile)] : [];
        })
        .sort((a, b) => b.rating - a.rating);
    });
  },

  getProfile(userId: string): Promise<WorkerProfile> {
    return runService(() => requireWorkerProfile(readDb(), userId));
  },

  /**
   * Name, rating and ID-Card badges by worker id (T8 open question 3), for
   * the customer's own jobs. Any verification status; unknown ids are skipped.
   */
  getSummaries(ids: string[]): Promise<WorkerSummary[]> {
    return runService(() => {
      const db = readDb();
      return [...new Set(ids)].flatMap((id) => {
        const user = db.users.find((item) => item.id === id && item.role === "worker");
        const profile = db.workerProfiles.find((item) => item.userId === id);
        return user && profile ? [toWorkerSummary(user, profile)] : [];
      });
    });
  },

  /** Saves onboarding progress. Also the demo "Approve" action (set both statuses to `verified`). */
  updateOnboarding(userId: string, patch: Partial<WorkerProfile>): Promise<WorkerProfile> {
    return runService(() =>
      updateDb((db) => {
        const profile = requireWorkerProfile(db, userId);
        const next: Partial<WorkerProfile> = { ...patch };
        delete next.userId;
        if (next.baseAddress)
          next.baseAddress = parseOrFail(addressSchema, next.baseAddress, "INVALID_INPUT");
        if (next.radiusMiles !== undefined)
          parseOrFail(radiusSchema, next.radiusMiles, "INVALID_INPUT");
        if (next.categories) parseOrFail(workerCategoriesSchema, next.categories, "INVALID_INPUT");
        Object.assign(profile, next);
        if (profile.idStatus !== "rejected" && profile.insuranceStatus !== "rejected") {
          delete profile.rejectionReason;
        }
        return profile;
      }),
    );
  },

  /** The file is checked, then dropped: nothing is stored or sent. Sets the matching status to `under_review`. */
  uploadDocument(userId: string, kind: DocumentKind, file: File): Promise<VerificationStatus> {
    return runService(() =>
      updateDb((db) => {
        const profile = requireWorkerProfile(db, userId);
        parseOrFail(
          documentFileSchemas[kind],
          file,
          "UPLOAD_FAILED",
          SERVICE_MESSAGES.uploadFailed,
        );
        const status: VerificationStatus = "under_review";
        if (kind === "insurance") {
          profile.insuranceStatus = status;
        } else {
          profile.idStatus = status;
        }
        if (profile.idStatus !== "rejected" && profile.insuranceStatus !== "rejected") {
          delete profile.rejectionReason;
        }
        return status;
      }),
    );
  },
};

// templates

export const templates = {
  list(customerId: string): Promise<Template[]> {
    return runService(() => readDb().templates.filter((item) => item.customerId === customerId));
  },

  save(customerId: string, name: string, draft: JobDraft): Promise<Template> {
    return runService(() =>
      updateDb((db) => {
        requireUser(db, customerId);
        const template: Template = {
          id: newId("tpl"),
          customerId,
          name: parseOrFail(templateNameSchema, name, "INVALID_INPUT"),
          job: { ...draft, savedAsTemplate: true },
        };
        db.templates.push(template);
        return template;
      }),
    );
  },
};

// payments

export const payments = {
  listMethods(userId: string): Promise<PaymentMethod[]> {
    return runService(() => readDb().paymentMethods[userId] ?? []);
  },

  /** Accepts a valid 16-digit (15 for Amex) number and stores only the brand and last 4 digits. */
  addMethod(userId: string, card: CardInput): Promise<PaymentMethod> {
    return runService(() =>
      updateDb((db) => {
        requireUser(db, userId);
        const data = parseOrFail(cardSchema, card, "CARD_FAILED", SERVICE_MESSAGES.cardFailed);
        const brand =
          detectCardBrand(data.number) ?? fail("CARD_FAILED", SERVICE_MESSAGES.cardFailed);
        const method: PaymentMethod = { id: newId("pm"), brand, last4: data.number.slice(-4) };
        db.paymentMethods[userId] = [...(db.paymentMethods[userId] ?? []), method];
        return method;
      }),
    );
  },
};

// earnings

export const earnings = {
  /** Totals and payouts derived from the worker's completed jobs. */
  summary(workerId: string): Promise<EarningsSummary> {
    return runService(() => {
      const db = readDb();
      requireWorkerProfile(db, workerId);
      const payouts = db.jobs
        .filter((job) => job.workerId === workerId && job.status === "completed")
        .map((job) => ({
          jobId: job.id,
          category: job.category,
          amount: jobTotal(job),
          completedAt: job.completedAt ?? job.createdAt,
        }))
        .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
      return {
        workerId,
        totalEarned: roundCents(payouts.reduce((sum, payout) => sum + payout.amount, 0)),
        completedJobs: payouts.length,
        payouts,
      };
    });
  },
};

// users

export const users = {
  /** Updates account details (also completes new social users: mobile and date of birth). */
  update(userId: string, patch: UserPatch): Promise<User> {
    return runService(async () => {
      const user = updateDb((db) => {
        const target = requireUser(db, userId);
        const next: UserPatch = { ...patch };
        if (next.email !== undefined) {
          next.email = parseOrFail(emailSchema, next.email, "INVALID_INPUT");
          const owner = findUserByEmail(db, next.email);
          if (owner && owner.id !== userId) fail("ACCOUNT_EXISTS", SERVICE_MESSAGES.accountExists);
        }
        if (next.firstName !== undefined)
          next.firstName = parseOrFail(firstNameSchema, next.firstName, "INVALID_INPUT");
        if (next.lastName !== undefined)
          next.lastName = parseOrFail(lastNameSchema, next.lastName, "INVALID_INPUT");
        if (next.mobile !== undefined && next.mobile !== target.mobile) {
          next.mobile = parseOrFail(mobileSchema, next.mobile, "INVALID_INPUT");
          if (next.phoneVerified === undefined) next.phoneVerified = false;
        }
        if (next.dob !== undefined) next.dob = parseOrFail(dobSchema, next.dob, "INVALID_INPUT");
        Object.assign(target, next);
        return target;
      });
      await syncSessionUser(user);
      return user;
    });
  },
};

// addresses

export const addresses = {
  /** Mocked autocomplete: seed and posted addresses that match the query (2+ characters). */
  suggest(query: string): Promise<Address[]> {
    return runService(() => {
      const needle = query.trim().toLowerCase();
      if (needle.length < 2) return [];
      const db = readDb();
      const all = [
        ...db.workerProfiles.map((profile) => profile.baseAddress),
        ...db.jobs.map((job) => job.address),
        ...db.templates.flatMap((template) => (template.job.address ? [template.job.address] : [])),
      ];
      const seen = new Set<string>();
      const results: Address[] = [];
      for (const { line1, city, state, zip } of all) {
        if (!line1) continue;
        const key = `${line1}|${zip}`.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        if (`${line1} ${city} ${state} ${zip}`.toLowerCase().includes(needle)) {
          results.push({ line1, city, state, zip });
        }
      }
      return results.slice(0, LIMITS.addressSuggestionsMax);
    });
  },
};

// notify

export const notify = {
  /** Stores a notify-me request for an address outside the service area. */
  capture(email: string, address: Address): Promise<void> {
    return runService(() => {
      const data = {
        email: parseOrFail(emailSchema, email, "INVALID_INPUT"),
        address: parseOrFail(addressSchema, address, "INVALID_INPUT"),
      };
      updateDb((db) => {
        db.notifyRequests.push({ ...data, createdAt: nowIso() });
      });
    });
  },
};

// favourites

export const favourites = {
  list(customerId: string): Promise<WorkerSummary[]> {
    return runService(() => {
      const db = readDb();
      return (db.favourites[customerId] ?? []).flatMap((workerId) => {
        const user = db.users.find((item) => item.id === workerId);
        const profile = db.workerProfiles.find((item) => item.userId === workerId);
        return user && profile ? [toWorkerSummary(user, profile)] : [];
      });
    });
  },

  /** Adds or removes a favourite worker. Resolves `true` when the worker is now a favourite. */
  toggle(customerId: string, workerId: string): Promise<boolean> {
    return runService(() =>
      updateDb((db) => {
        requireUser(db, customerId);
        requireWorkerProfile(db, workerId);
        const current = db.favourites[customerId] ?? [];
        const isFavourite = !current.includes(workerId);
        db.favourites[customerId] = isFavourite
          ? [...current, workerId]
          : current.filter((id) => id !== workerId);
        return isFavourite;
      }),
    );
  },
};

// Demo utilities (exempt from ?mockError=1)

function countBy<K extends string>(keys: readonly K[], values: readonly K[]): Record<K, number> {
  const counts = Object.fromEntries(keys.map((key) => [key, 0])) as Record<K, number>;
  values.forEach((value) => {
    counts[value] += 1;
  });
  return counts;
}

function countDb(db: MockDb): SeedCounts {
  const workerUsers = db.users.filter((user) => user.role === "worker");
  const workerStatuses = workerUsers.flatMap((user) => {
    const profile = db.workerProfiles.find((item) => item.userId === user.id);
    return profile ? [overallStatus(profile)] : [];
  });
  return {
    categories: db.categories.length,
    customers: db.users.filter((user) => user.role === "customer").length,
    workers: workerUsers.length,
    jobs: db.jobs.length,
    templates: db.templates.length,
    paymentMethods: Object.values(db.paymentMethods).reduce((sum, list) => sum + list.length, 0),
    workersByStatus: countBy(VERIFICATION_STATUSES, workerStatuses),
    jobsByStatus: countBy(
      JOB_STATUSES,
      db.jobs.map((job) => job.status),
    ),
  };
}

/** Dev only (/dev/mock): current counts next to the seed counts. */
export function getSeedSummary(): Promise<SeedSummary> {
  return runService(() => ({ current: countDb(readDb()), expected: countDb(createSeedDb()) }), {
    exemptFromMockError: true,
  });
}

/** Restores the seed and clears the session, job draft and onboarding stores. */
export function resetDemoData(): Promise<void> {
  return runService(
    () => {
      resetDb();
      clearStores();
    },
    { exemptFromMockError: true },
  );
}

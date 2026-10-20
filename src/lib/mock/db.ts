import { SEED } from "@/lib/mock/seed";
import type {
  Category,
  Job,
  NotifyRequest,
  PaymentMethod,
  Template,
  User,
  WorkerProfile,
} from "@/lib/types";

/*
 * The persisted mock database. Internal to src/lib/mock: UI code never
 * imports it (or the seed); it goes through services.ts.
 *
 * The seed is copied in on first use and saved to localStorage after every
 * write, so data created as one account (a posted job, a new sign-up) is still
 * there after switching accounts or reloading. On the server, or when storage
 * is blocked, it lives in memory only.
 */

export interface MockDb {
  version: number;
  categories: Category[];
  users: User[];
  workerProfiles: WorkerProfile[];
  jobs: Job[];
  templates: Template[];
  /** Keyed by user id (`PaymentMethod` has no owner field). */
  paymentMethods: Record<string, PaymentMethod[]>;
  /** Customer id → favourite worker ids. */
  favourites: Record<string, string[]>;
  notifyRequests: NotifyRequest[];
}

const DB_VERSION = SEED.version;
const DB_KEY = "cfm-mock-db";

let memoryDb: MockDb | null = null;

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** A fresh deep copy of the seed. */
export function createSeedDb(): MockDb {
  return structuredClone(SEED);
}

function isMockDb(value: unknown): value is MockDb {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as MockDb).version === DB_VERSION &&
    Array.isArray((value as MockDb).users) &&
    Array.isArray((value as MockDb).jobs)
  );
}

/** Reads the current database (seeding it on first use). Reads storage on every call so tabs stay in sync. */
export function readDb(): MockDb {
  const storage = getStorage();
  if (storage) {
    try {
      const raw = storage.getItem(DB_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isMockDb(parsed)) {
          memoryDb = parsed;
          return parsed;
        }
      }
    } catch {
      // Corrupt data: fall through and reseed.
    }
    const fresh = createSeedDb();
    writeDb(fresh);
    return fresh;
  }
  if (!memoryDb) memoryDb = createSeedDb();
  return memoryDb;
}

export function writeDb(db: MockDb): void {
  memoryDb = db;
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    // Quota or privacy mode: keep the in-memory copy.
  }
}

/** Runs a mutation against the database and saves it. */
export function updateDb<T>(mutate: (db: MockDb) => T): T {
  const db = readDb();
  const result = mutate(db);
  writeDb(db);
  return result;
}

/** Restores the seed. */
export function resetDb(): void {
  writeDb(createSeedDb());
}

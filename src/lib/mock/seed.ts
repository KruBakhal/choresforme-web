import { CATEGORIES } from "@/lib/constants";
import type { MockDb } from "@/lib/mock/db";
import type { Address, Job, Template, User, WorkerProfile } from "@/lib/types";

/*
 * Seed data (Tech Spec "Data model", seed table). Internal to src/lib/mock:
 * only db.ts reads it. Fixed ids and fixed ISO timestamps, so the seed is the
 * same on every load.
 *
 * [provisional] Cities (Austin, Dallas, Houston, TX), people, addresses and
 * the rejection reason are demo placeholders. Jobs have no photos and workers
 * use initials avatars (decision 8).
 */

/** Bump when the seed shape changes: saved databases with another version are reseeded. */
const SEED_VERSION = 1;

// Ids the mock layer refers to

export const SEED_IDS = {
  demoCustomer: "cust-demo",
  newCustomer: "cust-new",
  demoWorker: "wrk-demo",
} as const;

// Addresses (also the mocked address autocomplete source)

const ADDRESSES = {
  austinLamar: { line1: "1208 S Lamar Blvd", city: "Austin", state: "TX", zip: "78704" },
  austinManchaca: { line1: "5106 Manchaca Rd", city: "Austin", state: "TX", zip: "78745" },
  austinResearch: { line1: "10900 Research Blvd", city: "Austin", state: "TX", zip: "78758" },
  austinFifth: {
    line1: "201 W 5th St",
    city: "Austin",
    state: "TX",
    zip: "78701",
    landmark: "Blue door next to the cafe",
  },
  austinCongress: { line1: "600 Congress Ave", city: "Austin", state: "TX", zip: "78701" },
  dallasRouth: { line1: "3110 Routh St", city: "Dallas", state: "TX", zip: "75201" },
  dallasGaston: { line1: "4815 Gaston Ave", city: "Dallas", state: "TX", zip: "75204" },
  dallasCedar: { line1: "3900 Cedar Springs Rd", city: "Dallas", state: "TX", zip: "75219" },
  houstonMcKinney: { line1: "1500 McKinney St", city: "Houston", state: "TX", zip: "77002" },
  houstonWestheimer: { line1: "2300 Westheimer Rd", city: "Houston", state: "TX", zip: "77006" },
  houstonKirby: { line1: "2100 Kirby Dr", city: "Houston", state: "TX", zip: "77019" },
} as const satisfies Record<string, Address>;

// Users: 2 customers, 6 workers

const customers: User[] = [
  {
    id: SEED_IDS.demoCustomer,
    role: "customer",
    firstName: "Jordan",
    lastName: "Miller",
    email: "demo.customer@choresforme.test",
    mobile: "+15125550101",
    phoneVerified: true,
    dob: "1988-06-14",
    authProvider: "email",
    createdAt: "2026-05-02T15:20:00.000Z",
  },
  {
    id: SEED_IDS.newCustomer,
    role: "customer",
    firstName: "Taylor",
    lastName: "Brooks",
    email: "new.customer@choresforme.test",
    mobile: "+15125550102",
    phoneVerified: true,
    dob: "1994-11-03",
    authProvider: "email",
    createdAt: "2026-10-01T09:00:00.000Z",
  },
];

const workers: User[] = [
  {
    id: SEED_IDS.demoWorker,
    role: "worker",
    firstName: "Marcus",
    lastName: "Johnson",
    email: "demo.worker@choresforme.test",
    mobile: "+15125550201",
    phoneVerified: true,
    dob: "1990-03-22",
    authProvider: "email",
    createdAt: "2026-03-11T13:45:00.000Z",
  },
  {
    id: "wrk-002",
    role: "worker",
    firstName: "Priya",
    lastName: "Patel",
    email: "priya.patel@choresforme.test",
    mobile: "+12145550202",
    phoneVerified: true,
    dob: "1985-09-08",
    authProvider: "google",
    createdAt: "2026-02-19T10:30:00.000Z",
  },
  {
    id: "wrk-003",
    role: "worker",
    firstName: "Luis",
    lastName: "Hernandez",
    email: "luis.hernandez@choresforme.test",
    mobile: "+17135550203",
    phoneVerified: true,
    dob: "1993-12-01",
    authProvider: "email",
    createdAt: "2026-04-07T16:10:00.000Z",
  },
  {
    id: "wrk-004",
    role: "worker",
    firstName: "Emma",
    lastName: "Davis",
    email: "emma.davis@choresforme.test",
    mobile: "+15125550204",
    phoneVerified: true,
    dob: "1998-07-17",
    authProvider: "facebook",
    createdAt: "2026-06-23T12:00:00.000Z",
  },
  {
    id: "wrk-005",
    role: "worker",
    firstName: "Noah",
    lastName: "Wilson",
    email: "noah.wilson@choresforme.test",
    mobile: "+15125550205",
    phoneVerified: true,
    dob: "2002-01-29",
    authProvider: "email",
    createdAt: "2026-10-09T08:15:00.000Z",
  },
  {
    id: "wrk-006",
    role: "worker",
    firstName: "Olivia",
    lastName: "Martinez",
    email: "olivia.martinez@choresforme.test",
    mobile: "+12145550206",
    phoneVerified: false,
    dob: "1996-04-05",
    authProvider: "email",
    createdAt: "2026-09-28T17:40:00.000Z",
  },
];

// Worker profiles: 4 verified, 1 under review, 1 rejected; ratings 3.8 to 5.0

const workerProfiles: WorkerProfile[] = [
  {
    userId: SEED_IDS.demoWorker,
    baseAddress: ADDRESSES.austinCongress,
    radiusMiles: 25,
    categories: ["outdoor", "disposal"],
    idStatus: "verified",
    insuranceStatus: "verified",
    payoutAdded: true,
    rating: 4.8,
    jobsCompleted: 42,
  },
  {
    userId: "wrk-002",
    baseAddress: ADDRESSES.dallasRouth,
    radiusMiles: 30,
    categories: ["cleaning", "custom"],
    idStatus: "verified",
    insuranceStatus: "verified",
    payoutAdded: true,
    rating: 5,
    jobsCompleted: 61,
  },
  {
    userId: "wrk-003",
    baseAddress: ADDRESSES.houstonMcKinney,
    radiusMiles: 30,
    categories: ["outdoor", "cleaning"],
    idStatus: "verified",
    insuranceStatus: "verified",
    payoutAdded: true,
    rating: 4.6,
    jobsCompleted: 27,
  },
  {
    userId: "wrk-004",
    baseAddress: ADDRESSES.austinLamar,
    radiusMiles: 15,
    categories: ["cleaning", "outdoor"],
    idStatus: "verified",
    insuranceStatus: "verified",
    payoutAdded: true,
    rating: 4.2,
    jobsCompleted: 12,
  },
  {
    userId: "wrk-005",
    baseAddress: ADDRESSES.austinManchaca,
    radiusMiles: 20,
    categories: ["outdoor"],
    idStatus: "under_review",
    insuranceStatus: "under_review",
    payoutAdded: false,
    rating: 3.9,
    jobsCompleted: 3,
  },
  {
    userId: "wrk-006",
    baseAddress: ADDRESSES.dallasCedar,
    radiusMiles: 40,
    categories: ["disposal"],
    idStatus: "rejected",
    insuranceStatus: "under_review",
    payoutAdded: false,
    rating: 3.8,
    jobsCompleted: 5,
    rejectionReason: "The ID photo was unclear. Please upload a new photo.",
  },
];

// Jobs: 12, every status, 3 cities, fixed and hourly, board and direct

const job = (
  fields: Omit<Job, "customerId" | "photos" | "savedAsTemplate"> & Partial<Job>,
): Job => ({
  customerId: SEED_IDS.demoCustomer,
  photos: [],
  savedAsTemplate: false,
  ...fields,
});

const jobs: Job[] = [
  job({
    id: "job-001",
    category: "outdoor",
    subServices: ["Lawn Mowing", "Weed Removal"],
    address: ADDRESSES.austinLamar,
    description: "Front and back lawn need mowing, plus weeds pulled along the fence line.",
    pricingType: "fixed",
    amount: 85,
    matchType: "board",
    status: "open",
    createdAt: "2026-10-15T14:05:00.000Z",
  }),
  job({
    id: "job-002",
    category: "disposal",
    subServices: ["Furniture Removal"],
    address: ADDRESSES.austinManchaca,
    description: "Haul away an old sofa and two armchairs from the garage.",
    pricingType: "hourly",
    amount: 45,
    hours: 3,
    matchType: "board",
    status: "open",
    createdAt: "2026-10-16T09:30:00.000Z",
  }),
  job({
    id: "job-003",
    category: "outdoor",
    subServices: ["Gutter Service"],
    address: ADDRESSES.austinResearch,
    description: "Clean out the gutters on a single-storey house and check the downspouts.",
    pricingType: "fixed",
    amount: 140,
    matchType: "board",
    status: "open",
    createdAt: "2026-10-17T11:00:00.000Z",
  }),
  job({
    id: "job-004",
    category: "cleaning",
    subServices: ["Deep Cleaning"],
    address: ADDRESSES.dallasGaston,
    description: "Deep clean of a two-bedroom apartment, including the oven and fridge.",
    pricingType: "fixed",
    amount: 180,
    matchType: "board",
    status: "open",
    createdAt: "2026-10-17T15:45:00.000Z",
  }),
  job({
    id: "job-005",
    category: "outdoor",
    subServices: ["Planting"],
    address: ADDRESSES.houstonWestheimer,
    description: "Plant six shrubs along the front walkway. Plants are already on site.",
    pricingType: "hourly",
    amount: 35,
    hours: 2,
    matchType: "board",
    status: "open",
    createdAt: "2026-10-18T08:20:00.000Z",
  }),
  job({
    id: "job-006",
    category: "cleaning",
    subServices: ["Standard Cleaning"],
    address: ADDRESSES.dallasRouth,
    description: "Regular clean of a one-bedroom condo: kitchen, bathroom and floors.",
    pricingType: "fixed",
    amount: 120,
    matchType: "direct",
    workerId: "wrk-002",
    status: "accepted",
    createdAt: "2026-10-12T10:00:00.000Z",
  }),
  job({
    id: "job-007",
    category: "outdoor",
    subServices: ["Lawn Mowing"],
    address: ADDRESSES.austinFifth,
    description: "Mow the small front lawn and edge the sidewalk.",
    pricingType: "fixed",
    amount: 60,
    matchType: "board",
    workerId: SEED_IDS.demoWorker,
    status: "accepted",
    createdAt: "2026-10-13T13:15:00.000Z",
  }),
  job({
    id: "job-008",
    category: "disposal",
    subServices: ["Yard Waste", "Other"],
    otherText: "Old fence panels",
    address: ADDRESSES.austinLamar,
    description: "Bag and remove yard waste and take away four old fence panels.",
    pricingType: "hourly",
    amount: 40,
    hours: 2.5,
    matchType: "board",
    workerId: SEED_IDS.demoWorker,
    status: "in_progress",
    createdAt: "2026-10-10T07:50:00.000Z",
  }),
  job({
    id: "job-009",
    category: "cleaning",
    subServices: ["Window Cleaning"],
    address: ADDRESSES.houstonMcKinney,
    description: "Clean the inside and outside of twelve windows on the ground floor.",
    pricingType: "hourly",
    amount: 30,
    hours: 4,
    matchType: "direct",
    workerId: "wrk-003",
    status: "in_progress",
    createdAt: "2026-10-11T12:30:00.000Z",
  }),
  job({
    id: "job-010",
    category: "outdoor",
    subServices: ["Weed Removal"],
    address: ADDRESSES.austinManchaca,
    description: "Clear weeds from the vegetable beds and the gravel path.",
    pricingType: "fixed",
    amount: 95,
    matchType: "board",
    workerId: SEED_IDS.demoWorker,
    status: "completed",
    savedAsTemplate: true,
    createdAt: "2026-09-20T09:00:00.000Z",
    completedAt: "2026-09-21T16:30:00.000Z",
    customerRating: 5,
  }),
  job({
    id: "job-011",
    category: "cleaning",
    subServices: ["Move-in / Move-out"],
    address: ADDRESSES.dallasCedar,
    description: "Move-out clean of a studio apartment before the final inspection.",
    pricingType: "fixed",
    amount: 250,
    matchType: "direct",
    workerId: "wrk-002",
    status: "completed",
    createdAt: "2026-09-25T14:00:00.000Z",
    completedAt: "2026-09-27T18:10:00.000Z",
  }),
  job({
    id: "job-012",
    category: "custom",
    subServices: ["Other"],
    otherText: "Assemble a backyard playset",
    address: ADDRESSES.houstonKirby,
    description: "Assemble a wooden playset from the kit. All parts and tools are provided.",
    pricingType: "fixed",
    amount: 150,
    matchType: "board",
    status: "cancelled",
    createdAt: "2026-10-05T10:40:00.000Z",
  }),
];

// Templates: 2, for the customer with history

const templates: Template[] = [
  {
    id: "tpl-001",
    customerId: SEED_IDS.demoCustomer,
    name: "Weekly lawn mowing",
    job: {
      category: "outdoor",
      subServices: ["Lawn Mowing"],
      address: ADDRESSES.austinLamar,
      description: "Mow the front and back lawn and bag the clippings.",
      photos: [],
      pricingType: "fixed",
      amount: 75,
      matchType: "board",
      savedAsTemplate: true,
      lastStep: 6,
    },
  },
  {
    id: "tpl-002",
    customerId: SEED_IDS.demoCustomer,
    name: "Deep clean before guests",
    job: {
      category: "cleaning",
      subServices: ["Deep Cleaning"],
      address: ADDRESSES.austinFifth,
      description: "Deep clean of the kitchen, two bathrooms and the living room.",
      photos: [],
      pricingType: "hourly",
      amount: 40,
      hours: 4,
      matchType: "board",
      savedAsTemplate: true,
      lastStep: 6,
    },
  },
];

export const SEED: MockDb = {
  version: SEED_VERSION,
  categories: CATEGORIES.map((category) => ({
    ...category,
    subServices: [...category.subServices],
  })),
  users: [...customers, ...workers],
  workerProfiles,
  jobs,
  templates,
  // Payment methods: 1, Visa ending 4242
  paymentMethods: {
    [SEED_IDS.demoCustomer]: [{ id: "pm-001", brand: "visa", last4: "4242" }],
  },
  favourites: {
    [SEED_IDS.demoCustomer]: ["wrk-002"],
  },
  notifyRequests: [],
};

import {
  BriefcaseBusiness,
  ClipboardList,
  History,
  House,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type {
  Category,
  CategoryId,
  JobStatus,
  MatchType,
  OnboardingStep,
  PricingType,
  Role,
  SocialProvider,
  VerificationStatus,
} from "@/lib/types";

/*
 * Copy and navigation config. T2 adds layout, navigation and state copy only;
 * T3 extends this file.
 */

// Brand

export const BRAND_NAME = "Chores For Me";
export const BRAND_TAGLINE =
  "Chores For Me connects customers with verified local workers for home chores.";
export const BRAND_LOGO_MARK_SRC = "/brand/logo-mark-white.png";

// Accessibility labels

export const A11Y = {
  skipToContent: "Skip to main content",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  menuTitle: "Menu",
  mainNav: "Main",
  footerNav: "Footer",
  dashboardNav: "Dashboard",
} as const;

// Header

export type LinkItem = { label: string; href: string };

export const HEADER_NAV: readonly LinkItem[] = [
  { label: "Services", href: "/#services" },
  { label: "How it works", href: "/how-it-works" },
  { label: "For workers", href: "/workers" },
];

export const HEADER_ACTIONS = {
  logIn: { label: "Log in", href: "/login" },
  signUp: { label: "Sign up", href: "/signup" },
  postJob: { label: "Post a job", href: "/post-job/category" },
} as const satisfies Record<string, LinkItem>;

// Footer

/* Placeholders until the client provides the real Google Play URLs. */
export const PLAY_STORE_CUSTOMER_URL_PLACEHOLDER = "#";
export const PLAY_STORE_WORKER_URL_PLACEHOLDER = "#";

export const SUPPORT_EMAIL = "support@choresforme.com";

export const FOOTER = {
  appHeading: "Get the app",
  supportHeading: "Support",
  legalHeading: "Legal",
  customerAppLabel: "Customer app on Google Play",
  workerAppLabel: "Worker app on Google Play",
  privacy: { label: "Privacy Policy", href: "/privacy" },
  terms: { label: "Terms", href: "/terms" },
  copyright: (year: number) => `© ${year} Chores For Me. All rights reserved.`,
} as const;

// Dashboard navigation

export type NavMatch = "exact" | "prefix";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  match: NavMatch;
};

export const NAV_ITEMS: Record<Role, readonly NavItem[]> = {
  customer: [
    { label: "Home", href: "/dashboard", icon: House, match: "exact" },
    { label: "Jobs", href: "/dashboard/jobs", icon: ClipboardList, match: "prefix" },
    { label: "History", href: "/dashboard/history", icon: History, match: "prefix" },
    { label: "Account", href: "/dashboard/account", icon: UserRound, match: "prefix" },
  ],
  worker: [
    { label: "Jobs", href: "/worker/dashboard", icon: ClipboardList, match: "exact" },
    {
      label: "My Jobs",
      href: "/worker/dashboard/my-jobs",
      icon: BriefcaseBusiness,
      match: "prefix",
    },
    { label: "Earnings", href: "/worker/dashboard/earnings", icon: Wallet, match: "prefix" },
    { label: "Account", href: "/worker/dashboard/account", icon: UserRound, match: "prefix" },
  ],
};

// Screen states

export const STATE_COPY = {
  loading: "Loading…",
  errorTitle: "Something went wrong",
  errorMessage: "We couldn't load this right now. Please try again.",
  retry: "Retry",
  retrying: "Retrying…",
  submittingExample: "Posting your job…",
} as const;

// Styleguide (/styleguide, dev showcase, not linked from the app)

export const STYLEGUIDE_COPY = {
  metaTitle: "Styleguide · Chores For Me",
  title: "Styleguide",
  intro:
    "Every design token and shared component. Resize the window to check 1024, 768 and 375 px.",
  tocLabel: "Styleguide sections",
  sections: {
    brand: {
      title: "Brand",
      intro: "The logo lockup on light and dark surfaces, and the mark on its own.",
    },
    colours: {
      title: "Colours",
      intro:
        "The 12 colour tokens with their approved text pairing, and the shadcn aliases that point at them.",
    },
    typography: {
      title: "Typography",
      intro: "One family (Poppins), two weights and seven sizes.",
    },
    spacing: {
      title: "Spacing and layout",
      intro: "Spacing steps, radii, breakpoints, the content width, the grid and the touch target.",
    },
    primitives: {
      title: "Primitives",
      intro: "Buttons in every variant and size, separators, skeletons and the sheet.",
    },
    headerFooter: {
      title: "Header and Footer",
      intro: "The marketing header and footer, shown in preview frames.",
    },
    appShell: {
      title: "App shell",
      intro: "The dashboard shell for each role, the side nav in both modes and the bottom nav.",
    },
    states: {
      title: "States",
      intro: "Loading, empty and error states used on every data screen.",
    },
  },
  captions: {
    lockupOnLight: "Lockup on surface",
    lockupOnDark: "Lockup on surface-dark",
    markOnBrand: "Mark on brand",
    markOnDark: "Mark on surface-dark",
    aliases: "shadcn aliases",
    weights: "Weights",
    family: "Family",
    radii: "Radii",
    breakpoints: "Breakpoints and content width",
    grid: "Grid: 4 columns (mobile), 8 (from 768 px), 12 (from 1024 px)",
    touchTarget: "44 × 44 px minimum",
    buttons: "Buttons",
    separator: "Separator",
    skeleton: "Skeleton",
    sheet: "Sheet",
    header: "Header. Resize to see the tablet menu (768–1023) and mobile layout (< 768)",
    footer: "Footer",
    mobileCta: "Mobile only (< 768 px): sticky Post a job bar",
    customerShell: "Customer",
    workerShell: "Worker",
    sideNavFull: "SideNav, full",
    sideNavIcon: "SideNav, icon only",
    bottomNavCustomer: "BottomNav, customer",
    bottomNavWorker: "BottomNav, worker",
    railTitle: "Templates",
    railBody: "Right-rail placeholder. It stacks under the main content below 1280 px.",
    railLabel: "Templates",
    loading: "LoadingState",
    emptyWithAction: "EmptyState with action",
    emptyWithoutAction: "EmptyState without action",
    error: "ErrorState",
  },
  samples: {
    typeSentence: "Get help with home chores today",
    emptyTitle: "No jobs yet",
    emptyDescription: "When you post a job, it shows up here.",
    errorSecondary: "Back to dashboard",
    errorSecondaryHref: "/dashboard",
  },
  demo: {
    openSheet: "Open sheet",
    sheetTitle: "Sheet title",
    sheetBody: "Sheets open from the side, trap focus and close with Esc.",
    loaded: "Loaded (demo only — no service call)",
    showErrorAgain: "Show error again",
  },
} as const;

/*
 * ---------------------------------------------------------------------------
 * T3: domain constants, limits, demo accounts and messages.
 * Values marked [provisional] are orchestrator placeholders until the client
 * confirms them (logged as open questions in docs/tickets/PROGRESS.md).
 * ---------------------------------------------------------------------------
 */

// Categories and sub-services

/** Opens the free-text field when selected. */
export const OTHER_SUB_SERVICE = "Other";

export const CATEGORY_IDS = [
  "outdoor",
  "cleaning",
  "disposal",
  "custom",
] as const satisfies readonly CategoryId[];

/** Category names from the apps. Sub-services for cleaning, disposal and custom are [provisional]. */
export const CATEGORIES: readonly Category[] = [
  {
    id: "outdoor",
    name: "Outdoor Home Service",
    subServices: ["Lawn Mowing", "Weed Removal", "Planting", "Gutter Service", OTHER_SUB_SERVICE],
  },
  {
    id: "cleaning",
    name: "House Cleaning",
    subServices: [
      "Standard Cleaning",
      "Deep Cleaning",
      "Move-in / Move-out",
      "Window Cleaning",
      OTHER_SUB_SERVICE,
    ],
  },
  {
    id: "disposal",
    name: "Item Disposal",
    subServices: [
      "Furniture Removal",
      "Appliance Removal",
      "Yard Waste",
      "Garage Cleanout",
      OTHER_SUB_SERVICE,
    ],
  },
  {
    id: "custom",
    name: "Custom",
    subServices: [OTHER_SUB_SERVICE],
  },
];

// Statuses and option labels

export const VERIFICATION_STATUSES = [
  "not_started",
  "under_review",
  "verified",
  "rejected",
] as const satisfies readonly VerificationStatus[];

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  not_started: "Not started",
  under_review: "Under review",
  verified: "Verified",
  rejected: "Rejected",
};

export const JOB_STATUSES = [
  "open",
  "accepted",
  "in_progress",
  "completed",
  "cancelled",
] as const satisfies readonly JobStatus[];

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  open: "Open",
  accepted: "Accepted",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** "Post to Job Board" is the default. */
export const MATCH_TYPE_LABELS: Record<MatchType, string> = {
  board: "Post to Job Board",
  direct: "Pick a Worker",
};

export const PRICING_TYPE_LABELS: Record<PricingType, string> = {
  fixed: "Fixed Price",
  hourly: "Hourly",
};

/** Worker onboarding steps, in order. */
export const ONBOARDING_STEPS = [
  "area",
  "services",
  "id",
  "insurance",
  "payout",
] as const satisfies readonly OnboardingStep[];

// US states (50 states plus DC)

export const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
] as const;

export type UsStateCode = (typeof US_STATES)[number]["code"];

/** States served at launch [provisional]. Other states show Step 3's notify-me capture. */
export const SERVED_STATES: readonly UsStateCode[] = ["TX"];

// Limits (price, hour and radius limits are provisional per the Tech Spec)

export const LIMITS = {
  nameMax: 50,
  fixedPriceMin: 5,
  fixedPriceMax: 5000,
  hourlyRateMin: 10,
  hourlyRateMax: 200,
  hoursMin: 1,
  hoursMax: 12,
  hoursStep: 0.5,
  radiusMin: 5,
  radiusMax: 200,
  /** Radius for a newly created worker profile [provisional]. */
  radiusDefault: 25,
  photosMax: 5,
  fileMaxBytes: 10 * 1024 * 1024,
  addressLine1Min: 3,
  addressLine1Max: 100,
  descriptionMin: 10,
  descriptionMax: 500,
  otherTextMin: 3,
  otherTextMax: 100,
  templateNameMin: 3,
  templateNameMax: 40,
  passwordMin: 8,
  workerMinAge: 18,
  ratingMin: 1,
  ratingMax: 5,
  routingNumberLength: 9,
  accountNumberMin: 4,
  accountNumberMax: 17,
  mockDelayMinMs: 400,
  mockDelayMaxMs: 800,
  sessionDays: 30,
  addressSuggestionsMax: 5,
} as const;

/** Accepted upload types (Tech Spec "Validation rules"). */
export const PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/heic", "image/webp"] as const;
export const DOCUMENT_MIME_TYPES = [...PHOTO_MIME_TYPES, "application/pdf"] as const;

// Demo accounts and mock auth

export const DEMO_OTP_CODE = "123456";

export const DEMO_ACCOUNTS = [
  { role: "customer", email: "demo.customer@choresforme.test", label: "Demo customer" },
  { role: "worker", email: "demo.worker@choresforme.test", label: "Demo worker" },
  {
    role: "customer",
    email: "new.customer@choresforme.test",
    label: "New customer (no history)",
  },
] as const satisfies readonly { role: Role; email: string; label: string }[];

/** Identity prefilled in the "Signing in with … (demo)" dialog [provisional]. */
export const DEMO_SOCIAL_IDENTITIES: Record<
  SocialProvider,
  { firstName: string; lastName: string; email: string }
> = {
  google: { firstName: "Alex", lastName: "Rivera", email: "alex.google@choresforme.test" },
  facebook: { firstName: "Sam", lastName: "Lee", email: "sam.facebook@choresforme.test" },
};

// Validation messages (Tech Spec "Validation rules", verbatim)

export const VALIDATION_MESSAGES = {
  firstName: "Enter your first name",
  lastName: "Enter your last name",
  email: "Enter a valid email address",
  password: "Use at least 8 characters with a letter and a number",
  mobile: "Enter a 10-digit US mobile number",
  otp: "Enter the 6-digit code",
  otpWrong: "That code didn't work. Try again",
  dob: "Enter your date of birth",
  dobUnder18: "You must be 18 or older to work on Chores For Me",
  terms: "Please accept the Terms and Privacy Policy",
  category: "Choose a category",
  subServices: "Choose at least one service",
  otherText: "Describe the other service",
  addressLine1: "Enter the street address",
  city: "Enter the city",
  state: "Choose a state",
  zip: "Enter a 5-digit ZIP code",
  description: "Add a few words about the job (at least 10 characters)",
  photosMax: "You can add up to 5 photos",
  photoSize: "Photos must be under 10 MB",
  fixedPrice: "Enter a price between $5 and $5,000",
  hourlyRate: "Enter an hourly rate between $10 and $200",
  hours: "Choose between 1 and 12 hours",
  matchType: "Choose a worker or post to the job board",
  templateName: "Name this template",
  cardNumber: "Enter a valid card number",
  expiry: "Enter a valid expiry date",
  cvc: "Enter the security code",
  radius: "Choose a radius between 5 and 200 miles",
  workerCategories: "Choose at least one service you offer",
  idFront: "Upload the front of your ID",
  idBack: "Upload the back of your ID",
  insurance: "Upload your insurance document",
  routingNumber: "Enter a 9-digit routing number",
  accountNumber: "Enter a valid account number",
  /* Not in the spec table [provisional copy]. */
  loginPassword: "Enter your password",
  photoType: "Photos must be JPG, PNG, HEIC or WebP",
} as const;

// Service messages (mock service rejections)

export const SERVICE_MESSAGES = {
  noAccount: "No account found",
  accountExists: "You already have an account — log in",
  jobTaken: "This job was just taken",
  otpWrong: "That code didn't work. Try again",
  jobNotFound: "We couldn't find this job",
  notVerified: "Verify to accept",
  cardFailed: "We couldn't add this card",
  uploadFailed: "Upload failed",
  mockError: STATE_COPY.errorMessage,
  /* Not in the spec [provisional copy]. */
  notAllowed: "This job can't be changed right now",
  signInRequired: "Log in to continue",
} as const;

// Screen state copy (Tech Spec "Screen states", verbatim; used by T5 to T10)

export const SCREEN_STATE_COPY = {
  customerHomeEmpty: "No jobs yet",
  historyEmpty: "Your finished jobs will appear here",
  jobNotFound: "We couldn't find this job",
  pickWorkerEmpty: "No verified workers in this area yet — post to the job board instead",
  boardEmpty: "No open jobs in your area right now",
  myJobsEmpty: "Jobs you accept will show here",
  earningsEmpty: "Complete your first job to see earnings",
  jobBuilderError: "Something went wrong. Your job is saved — try again",
  postingJob: "Posting your job…",
  cardError: "We couldn't add this card",
  uploadFailed: "Upload failed",
  underReview: "Under review",
  jobTaken: "This job was just taken",
  jobAccepted: "Job accepted",
} as const;

// Reset demo data (Footer link and /dev/mock)

export const RESET_DEMO_COPY = {
  label: "Reset demo data",
  resetting: "Resetting…",
  confirm: "Reset demo data? This restores the sample jobs and accounts and signs you out.",
  error: "Couldn't reset demo data. Try again.",
} as const;

// Dev mock page (/dev/mock, dev showcase, not linked from the app)

export const DEV_MOCK_COPY = {
  metaTitle: "Mock services · Chores For Me",
  title: "Mock services",
  intro:
    "Calls every mock service with fixed sample arguments. Data persists in this browser until you reset it.",
  mockErrorHint:
    "Add ?mockError=1 to the URL to make the first service call after the page loads fail. Retry then succeeds.",
  armedNotice:
    "Error mode is on: the first service call on this page will fail. Retry then succeeds.",
  loadWithError: "Load with ?mockError=1",
  loadWithoutError: "Load without ?mockError",
  jumpNavLabel: "Page sections",
  sections: [
    { id: "seed", label: "Seed check" },
    { id: "auth", label: "Auth" },
    { id: "jobs", label: "Jobs" },
    { id: "workers", label: "Workers" },
    { id: "templates", label: "Templates" },
    { id: "payments", label: "Payments" },
    { id: "earnings", label: "Earnings" },
    { id: "users", label: "Users" },
    { id: "addresses", label: "Addresses" },
    { id: "notify", label: "Notify" },
    { id: "favourites", label: "Favourites" },
    { id: "stores", label: "Stores" },
  ],
  seed: {
    title: "Seed check",
    intro: "Counts from getSeedSummary() compared with the seed.",
    idle: "Run the seed check to load the counts.",
    expected: (n: number) => `Seed: ${n}`,
    matches: "Matches seed",
    changed: "Changed",
    emptyTitle: "The mock database is empty",
    loading: "Running getSeedSummary…",
    tiles: {
      categories: "Categories",
      customers: "Customers",
      workers: "Workers",
      jobs: "Jobs",
      templates: "Templates",
      paymentMethods: "Payment methods",
    },
  },
  run: "Run",
  running: "Running…",
  runningLabel: (name: string) => `Running ${name}…`,
  idle: "Not run yet.",
  resolvedIn: (ms: number) => `Resolved in ${ms} ms`,
  noValue: "no value",
  rejectedIn: (ms: number, code: string) => `Rejected in ${ms} ms · code ${code}`,
  emptyTitle: "Empty result",
  emptyDescription: "The service resolved with an empty list.",
  mockErrorTitle: "Simulated error (?mockError=1)",
  serviceErrorTitle: "Service rejected",
  resultLabel: (name: string) => `${name} result`,
  groups: {
    auth: { title: "Auth", intro: "Mock sign-up, login, OTP and session." },
    jobs: {
      title: "Jobs",
      intro: "Creating a job needs a session: log in as the demo customer first.",
    },
    workers: { title: "Workers", intro: "Profiles, onboarding and document uploads." },
    templates: { title: "Templates", intro: "Saved jobs that can be re-posted." },
    payments: { title: "Payments", intro: "Only the brand and last 4 digits are stored." },
    earnings: { title: "Earnings", intro: "Derived from the worker's completed jobs." },
    users: { title: "Users", intro: "Account details." },
    addresses: { title: "Addresses", intro: "Autocomplete suggestions from the seed addresses." },
    notify: {
      title: "Notify",
      intro: "Notify-me capture for addresses outside the service area.",
    },
    favourites: { title: "Favourites", intro: "A customer's favourite workers." },
  },
  calls: {
    loginCustomer: { argsLabel: "demo.customer@choresforme.test · any password" },
    loginWorker: { argsLabel: "demo.worker@choresforme.test · any password" },
    loginUnknown: {
      argsLabel: "nobody@choresforme.test · any password",
      expectLabel: "Rejected with “No account found”",
    },
    signUpWorker: {
      argsLabel: "New worker · new.worker@choresforme.test",
      expectLabel:
        "Creates the worker and signs in. A second run is rejected with “You already have an account — log in”",
    },
    signUpExisting: {
      argsLabel: "Customer · demo.customer@choresforme.test",
      expectLabel: "Rejected with “You already have an account — log in”",
    },
    loginGoogle: { argsLabel: "Google · customer · Alex Rivera" },
    loginFacebook: {
      argsLabel: "Facebook · worker · Sam Lee",
      expectLabel: "New social users come back with an empty mobile and date of birth",
    },
    sendOtp: { argsLabel: "+15125550101" },
    verifyOtpRight: { argsLabel: "+15125550101 · 123456", expectLabel: "Resolves true" },
    verifyOtpWrong: { argsLabel: "+15125550101 · 000000", expectLabel: "Resolves false" },
    passwordReset: { argsLabel: "demo.customer@choresforme.test" },
    logout: { argsLabel: "Clears the session, keeps the mock data" },
    listForCustomer: { argsLabel: "Demo customer" },
    listForCustomerNew: { argsLabel: "New customer", expectLabel: "Empty list" },
    listBoard: { argsLabel: "Demo worker (Austin, 25 miles, outdoor and disposal)" },
    listForWorker: { argsLabel: "Demo worker" },
    getJob: { argsLabel: "job-001" },
    getJobMissing: {
      argsLabel: "job-missing",
      expectLabel: "Rejected with “We couldn't find this job”",
    },
    createJob: {
      argsLabel: "Board job · Lawn Mowing · Austin · $90 fixed",
      expectLabel: "Needs a customer session; otherwise rejected",
    },
    accept: {
      argsLabel: "job-003 · demo worker",
      expectLabel: "Run twice: the second run is rejected with “This job was just taken”",
    },
    acceptUnverified: {
      argsLabel: "job-001 · under-review worker",
      expectLabel: "Rejected with “Verify to accept”",
    },
    updateJob: { argsLabel: "job-005 · new description", expectLabel: "Open jobs only" },
    cancel: {
      argsLabel: "job-004",
      expectLabel: "Open and accepted jobs only; a second run is rejected",
    },
    start: { argsLabel: "job-006 (accepted)" },
    complete: { argsLabel: "job-009 (in progress)" },
    rate: {
      argsLabel: "job-011 · 5 stars",
      expectLabel: "Completed jobs only, once; a second run is rejected",
    },
    listForArea: { argsLabel: "Austin, TX · Outdoor Home Service", expectLabel: "Verified only" },
    listForAreaEmpty: {
      argsLabel: "Denver, CO · Outdoor Home Service",
      expectLabel: "Empty list",
    },
    getProfile: { argsLabel: "Demo worker" },
    getProfileRejected: { argsLabel: "Rejected worker" },
    approve: {
      argsLabel: "Under-review worker · ID and insurance verified",
      expectLabel: "The demo Approve action",
    },
    uploadDocument: {
      argsLabel: "Rejected worker · id_front · demo image",
      expectLabel: "Resolves “under_review”",
    },
    listTemplates: { argsLabel: "Demo customer" },
    listTemplatesNew: { argsLabel: "New customer", expectLabel: "Empty list" },
    saveTemplate: { argsLabel: "Demo customer · “Monthly gutter clean”" },
    listMethods: { argsLabel: "Demo customer" },
    listMethodsNew: { argsLabel: "New customer", expectLabel: "Empty list" },
    addMethod: {
      argsLabel: "New customer · Mastercard 5555 5555 5555 4444 · 12/30",
      expectLabel: "Stores only the brand and last 4",
    },
    earnings: { argsLabel: "Demo worker" },
    updateUser: { argsLabel: "New customer · mobile +15125550199" },
    suggest: { argsLabel: "“Austin”" },
    suggestEmpty: { argsLabel: "“zzz”", expectLabel: "Empty list" },
    capture: { argsLabel: "new.customer@choresforme.test · Denver, CO" },
    listFavourites: { argsLabel: "Demo customer" },
    listFavouritesNew: { argsLabel: "New customer", expectLabel: "Empty list" },
    toggleFavourite: {
      argsLabel: "Demo customer · Houston worker",
      expectLabel: "Resolves true when added, false when removed",
    },
  },
  stores: {
    title: "Stores",
    intro: "Live values from the persisted stores in this browser.",
    session: "Session",
    draft: "Job draft",
    onboarding: "Worker onboarding",
    empty: "Empty",
    clear: "Clear",
  },
} as const;

import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarCheck,
  ClipboardList,
  History,
  House,
  IdCard,
  ListChecks,
  MapPin,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Trash2,
  Trees,
  UserPlus,
  UserRound,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type {
  CardBrand,
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
  newTab: "(opens in a new tab)",
  breadcrumb: "Breadcrumb",
  onThisPage: "On this page",
  closeDialog: "Close",
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

/* Google Play listings from the live choresforme.com (T4 decision 13). */
export const PLAY_STORE_CUSTOMER_URL =
  "https://play.google.com/store/apps/details?id=com.choresforme.user";
export const PLAY_STORE_WORKER_URL =
  "https://play.google.com/store/apps/details?id=com.choresforme.worker";

/* Support contact from the live choresforme.com (T4 decision 12). */
export const SUPPORT_EMAIL = "choresformesupport@protonmail.com";
export const SUPPORT_PHONE = "(801) 948-0847";
export const SUPPORT_PHONE_HREF = "tel:+18019480847";

export const FOOTER = {
  servicesHeading: "Services",
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
  /* T5 decision 1 [provisional copy]. */
  mobileUnverified: "Verify your mobile number",
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
  /* T5 decision 2 and 3 [provisional copy]. */
  roleMismatch: "Customer and worker accounts are separate",
  roleRequired: "Choose an account type to continue.",
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

/*
 * ---------------------------------------------------------------------------
 * T4: marketing pages. Copy marked [provisional] needs client approval
 * (T4 decisions 2, 3 and 18). FAQ answers come from the live choresforme.com,
 * lightly copy-edited (T4 decision 1).
 * ---------------------------------------------------------------------------
 */

// Site

/** Origin used by robots.txt and sitemap.xml [provisional until the demo host is known]. */
export const SITE_URL = "https://choresforme.com";

// Routes

export const WORKER_SIGNUP_HREF = "/signup?role=worker";
export const WORKERS_HREF = "/workers";
export const HOW_IT_WORKS_HREF = "/how-it-works";
export const FAQ_HREF = "/faq";
export const SERVICES_ANCHOR_HREF = "/#services";

/** Job builder with the category pre-selected (skips step 1). */
export const postJobForCategory = (id: CategoryId) => `/post-job/services?category=${id}`;
export const serviceHref = (id: CategoryId) => `/services/${id}`;

// Categories (marketing)

export const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  outdoor: Trees,
  cleaning: Sparkles,
  disposal: Trash2,
  custom: Wrench,
};

/** One short line per category [provisional]. */
export const CATEGORY_DESCRIPTIONS: Record<CategoryId, string> = {
  outdoor: "Lawn mowing, weeding, planting and gutters.",
  cleaning: "Standard, deep and move-out cleaning.",
  disposal: "Furniture, appliances, yard waste and cleanouts.",
  custom: "Describe any chore that doesn't fit the others.",
};

// Shared marketing types

export type MarketingStep = {
  title: string;
  body: string;
  href?: string;
  linkLabel?: string;
};

export type MarketingPoint = { icon: LucideIcon; title: string; body: string };

// How it works [provisional] (T4 decision 2)

const CUSTOMER_STEPS: readonly MarketingStep[] = [
  {
    title: "Describe the job",
    body: "Choose a category, add the address and a few details, and set your price.",
    href: HEADER_ACTIONS.postJob.href,
    linkLabel: "Post a job",
  },
  {
    title: "Choose a worker or post to the board",
    body: "Pick a verified worker near you, or post to the job board and the first available worker accepts it.",
  },
  {
    title: "Get it done and rate",
    body: "Your card is charged when the job is completed. Then you and your worker rate each other.",
    href: "/faq#payment-timing",
    linkLabel: "When am I charged?",
  },
];

const WORKER_STEPS: readonly MarketingStep[] = [
  {
    title: "Create your account",
    body: "Sign up as a worker with your name, mobile number and date of birth. You must be 18 or older.",
    href: WORKER_SIGNUP_HREF,
    linkLabel: "Create worker account",
  },
  {
    title: "Set your area and services",
    body: "Choose where you work, how far you'll travel and the categories you offer.",
    href: "/faq#categories",
    linkLabel: "What categories can I choose?",
  },
  {
    title: "Browse jobs",
    body: "See open jobs in your area on the job board. Each job goes to the first worker who accepts it.",
  },
  {
    title: "Verify, accept and get paid",
    body: "Verify your ID and insurance, then accept jobs and get paid to your payout account.",
    href: "/faq#payouts",
    linkLabel: "How do I get paid?",
  },
];

export const HOW_IT_WORKS_COPY = {
  title: "How Chores For Me works",
  intro:
    "Customers post chores and verified local workers get them done. Here's how each side works.",
  jumpLinks: [
    { label: "For customers", href: "#customers" },
    { label: "For workers", href: "#workers" },
  ] as const satisfies readonly LinkItem[],
  customers: {
    title: "For customers",
    intro: "Post a job in a few minutes. No account needed to start.",
    steps: CUSTOMER_STEPS,
    cta: HEADER_ACTIONS.postJob.label,
  },
  workers: {
    title: "For workers",
    intro: "Set up once, then pick the jobs that suit you.",
    steps: WORKER_STEPS,
    cta: "Create worker account",
  },
} as const;

// Landing page (PRD "Landing / home page")

export const LANDING_COPY = {
  hero: {
    eyebrow: "Phone, ID and insurance verified",
    headline: "Your chores, done by verified local pros",
    supportingLine:
      "Describe your chore, pick a verified local worker or post it to the job board, and pay when it's done.",
    primaryCta: HEADER_ACTIONS.postJob.label,
    secondaryCta: "Earn with Chores For Me",
    noAccountNote: "No account needed to start a job.",
    pickerLabel: "Or start with a service",
  },
  services: {
    eyebrow: "Services",
    title: "What do you need done?",
    intro: "Pick a category to start your job. You'll add the details next.",
    tileAction: "Start a job",
  },
  howItWorks: {
    eyebrow: "How it works",
    title: "Three steps to a finished chore",
    intro: "From posting to paying, everything happens in your browser.",
    steps: CUSTOMER_STEPS,
    fullGuide: "See the full guide",
  },
  trust: {
    eyebrow: "Trust and safety",
    title: "What “verified” means",
    points: [
      {
        icon: Smartphone,
        title: "Phone check",
        body: "Every account confirms a US mobile number with a one-time code.",
      },
      {
        icon: IdCard,
        title: "Identity verification",
        body: "Workers upload a photo ID, front and back, before they accept jobs.",
      },
      {
        icon: ShieldCheck,
        title: "Insurance check",
        body: "Workers upload an insurance document, which is reviewed before approval.",
      },
      {
        icon: BadgeCheck,
        title: "Chores ID-Card",
        body: "Each worker has a Chores ID-Card that shows which checks are complete.",
      },
      {
        icon: Star,
        title: "Two-way ratings",
        body: "Customers rate workers and workers rate customers after every job.",
      },
    ] as const satisfies readonly MarketingPoint[],
    ratingRows: ["Customers rate workers", "Workers rate customers"],
  },
  workers: {
    eyebrow: "For workers",
    title: "Earn with Chores For Me",
    points: [
      {
        icon: MapPin,
        title: "Set your own area and services",
        body: "Choose where you work and which categories you offer.",
      },
      {
        icon: ListChecks,
        title: "Choose the jobs you want",
        body: "Browse open jobs near you and accept the ones that suit you.",
      },
      {
        icon: Wallet,
        title: "Get paid to your payout account",
        body: "Money moves to your payout account when the customer's payment is made.",
      },
    ] as const satisfies readonly MarketingPoint[],
    cta: "Start earning",
    secondaryLink: "See what you'll need",
  },
  faq: {
    title: "Common questions",
    seeAll: "See all FAQs",
    itemIds: ["cancellation-fee", "payouts", "sole-proprietor"],
  },
  ctaBand: {
    title: "Ready to get it done?",
    body: "Post your first job in a few minutes. No account needed to start.",
    primary: { label: "Post your first job", href: HEADER_ACTIONS.postJob.href },
    secondary: { label: "Earn with Chores For Me", href: WORKERS_HREF },
  },
} as const;

// Service pages (/services/[category])

export const SERVICE_PAGE_COPY = {
  eyebrow: "Services",
  breadcrumbHome: "Home",
  breadcrumbServices: "Services",
  primaryCta: HEADER_ACTIONS.postJob.label,
  howLink: "How it works",
  includesTitle: "What's included",
  includesIntro: "Choose one or more of these when you post your job.",
  otherLabel: "Something else? Describe it in your job",
  customIncludesBody:
    "Describe any chore in your own words when you post the job. A verified local worker who offers custom work can take it on.",
  howTitle: "How it works",
  howIntro: "Three steps from posting to paying.",
  otherServicesTitle: "Other services",
  otherServicesAction: "See service",
  ctaTitle: (name: string) => `Get help with ${name}`,
  ctaBody: "Post your job in a few minutes. No account needed to start.",
  ctaSecondary: { label: "Earn with Chores For Me", href: WORKERS_HREF },
  /** Per-category copy [provisional]. Sub-service lists come from CATEGORIES. */
  pages: {
    outdoor: {
      metaTitle: "Outdoor Home Service · Chores For Me",
      metaDescription:
        "Lawn mowing, weed removal, planting and gutter service from verified local workers. Post your job and pay when it's done.",
      heading: "Outdoor home services by verified local pros",
      intro:
        "Lawn mowing, weed removal, planting and gutter service from verified local workers. Describe the job, set your price and pay when it's done.",
    },
    cleaning: {
      metaTitle: "House Cleaning · Chores For Me",
      metaDescription:
        "Standard, deep, move-in or move-out and window cleaning from verified local workers. Post your job and pay when it's done.",
      heading: "House cleaning by verified local pros",
      intro:
        "Standard, deep, move-in or move-out and window cleaning from verified local workers. Describe the job, set your price and pay when it's done.",
    },
    disposal: {
      metaTitle: "Item Disposal · Chores For Me",
      metaDescription:
        "Furniture and appliance removal, yard waste and garage cleanouts from verified local workers. Post your job and pay when it's done.",
      heading: "Item disposal by verified local pros",
      intro:
        "Furniture and appliance removal, yard waste and garage cleanouts from verified local workers. Describe the job, set your price and pay when it's done.",
    },
    custom: {
      metaTitle: "Custom Chores · Chores For Me",
      metaDescription:
        "Have a chore that doesn't fit a category? Describe it, set your price and a verified local worker can take it on.",
      heading: "Custom chores by verified local pros",
      intro:
        "Have a chore that doesn't fit a category? Describe it in your own words, set your price and a verified local worker can take it on.",
    },
  } satisfies Record<
    CategoryId,
    { metaTitle: string; metaDescription: string; heading: string; intro: string }
  >,
} as const;

// Workers page (/workers, Worker flow step 1 "Why join"; T4 decision 10)

export const WORKERS_PAGE_COPY = {
  eyebrow: "For workers",
  title: "Earn with Chores For Me",
  intro: "Choose your area, choose your jobs and get paid to your payout account.",
  cta: "Create worker account",
  /** The sticky mobile bar on /workers (T4 decision 9). */
  mobileCta: { label: "Create worker account", href: WORKER_SIGNUP_HREF, icon: UserPlus },
  whyJoin: {
    title: "Why join",
    points: [
      {
        icon: MapPin,
        title: "Choose your area",
        body: "Set your base address and how far you're willing to travel.",
      },
      {
        icon: ListChecks,
        title: "Choose your jobs",
        body: "Pick the categories you offer and accept the jobs you want.",
      },
      {
        icon: Wallet,
        title: "Get paid to your payout account",
        body: "Add a payout account linked to your bank account or card.",
      },
    ] as const satisfies readonly MarketingPoint[],
  },
  jobTypes: {
    title: "Jobs you can choose",
    intro: "Four categories of home chores. Offer the ones that suit your skills.",
  },
  needs: {
    title: "What you'll need",
    intro:
      "You can browse jobs first. Before you accept your first job, complete identity verification.",
    items: [
      { icon: IdCard, label: "Photo ID, front and back" },
      { icon: ShieldCheck, label: "Insurance document" },
      { icon: Wallet, label: "Payout account, needed before your first payout" },
      { icon: CalendarCheck, label: "18 or older" },
    ] as const satisfies readonly { icon: LucideIcon; label: string }[],
  },
  statusNote: `Your ID and insurance show as “${VERIFICATION_STATUS_LABELS.under_review}” until approved. Then your Chores ID-Card shows them as “${VERIFICATION_STATUS_LABELS.verified}”.`,
  faq: {
    title: "Worker questions",
    itemIds: ["experience", "payouts", "registration-time", "sole-proprietor"],
  },
  ctaBand: {
    title: "Ready to start earning?",
    body: "Create your worker account, set your area and start browsing jobs.",
  },
} as const;

// FAQ (/faq)

export type FaqAudience = "customer" | "worker";

export type FaqItem = {
  /** Stable slug: other pages link to /faq#<id>. */
  id: string;
  audience: FaqAudience;
  question: string;
  answer: string;
  /** External link shown after the answer (opens in a new tab). */
  link?: LinkItem;
};

/** Group order on /faq. */
export const FAQ_AUDIENCES = ["customer", "worker"] as const satisfies readonly FaqAudience[];

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    id: "cancel-job",
    audience: "customer",
    question: "How do I cancel a job?",
    answer:
      "Open the job in your dashboard and choose Cancel. You can cancel until the job has started.",
  },
  {
    id: "cancellation-fee",
    audience: "customer",
    question: "Is there a fee to cancel a job?",
    answer:
      "There's no fee while no worker has accepted your job. After a worker accepts, a cancellation fee may apply; the exact amount is being confirmed.",
  },
  {
    id: "payment-timing",
    audience: "customer",
    question: "When am I charged?",
    answer: "Your card is charged when the job is completed. There are no refunds in this version.",
  },
  {
    id: "tips",
    audience: "customer",
    question: "Can I add or change a tip?",
    answer: "Tipping is coming in a future update.",
  },
  {
    id: "experience",
    audience: "worker",
    question: "Do I need experience to work?",
    answer:
      "No. We don't ask for work experience; what matters is completing the chores you accept. Experience does help you pick the jobs that suit your strengths.",
  },
  {
    id: "payouts",
    audience: "worker",
    question: "How do I get paid?",
    answer:
      "Every worker sets up a payout account, which is required. It is linked to your bank account or card, and money moves to it when the customer's payment is made.",
  },
  {
    id: "registration-time",
    audience: "worker",
    question: "How long does it take to get registered?",
    answer: "Not long. Add a few details, verify your ID and insurance, and you're ready to go.",
  },
  {
    id: "categories",
    audience: "worker",
    question: "What categories can I choose from?",
    answer:
      "There are four: Outdoor Home Service, House Cleaning, Item Disposal and Custom. Custom lets you describe a skill that doesn't fit the other categories.",
  },
  {
    id: "sole-proprietor",
    audience: "worker",
    question: "Do I need to register as a sole proprietor?",
    answer:
      "Workers on Chores For Me are independent contractors. Many register a sole proprietorship: choose a business name, file an assumed business name (DBA) with your state, and get any licences or permits your work and city need. Requirements vary by state and city.",
    link: { label: "Read the full guide", href: "https://choresforme.com/sole-proprietor" },
  },
];

export const FAQ_COPY = {
  title: "Frequently asked questions",
  intro: "Answers for customers and workers.",
  searchLabel: "Search the FAQ",
  searchPlaceholder: "Try “payout” or “cancel”",
  resultsCount: (n: number, total: number) => `Showing ${n} of ${total} questions`,
  noResultsLine: (q: string) => `No questions match “${q}”`,
  clearSearch: "Clear search",
  noResultsTitle: "No questions match your search",
  noResultsDescription: "Try a different word, or contact support.",
  groups: {
    customer: "For customers",
    worker: "For workers",
  } satisfies Record<FaqAudience, string>,
  contact: {
    title: "Still have questions?",
    body: "Our support team is happy to help.",
  },
} as const;

// Legal placeholders (/privacy, /terms; T4 decision 16)

export const LEGAL_COPY = {
  eyebrow: "Legal",
  notice:
    "The final web version is being prepared. Until it's published, the current policy on choresforme.com applies.",
  questions: "Questions? Email",
  privacy: {
    title: FOOTER.privacy.label,
    currentLabel: "Read the current Privacy Policy",
    currentHref: "https://choresforme.com/privacy-policy",
  },
  terms: {
    title: FOOTER.terms.label,
    currentLabel: "Read the current Terms of Service",
    currentHref: "https://choresforme.com/terms-of-service",
  },
} as const;

// Illustrative previews (decorative sample content, not real records; T4 decision 15)

export const ID_CARD_PREVIEW_SAMPLE = {
  ariaLabel: "Sample Chores ID-Card",
  title: "Chores ID-Card",
  sampleTag: "Sample",
  name: "Sample worker",
  note: "Illustrative example",
  rows: [
    { icon: Smartphone, label: "Phone", detail: "Mobile number confirmed by SMS code" },
    { icon: IdCard, label: "ID", detail: "Photo ID checked, 18 or older" },
    { icon: ShieldCheck, label: "Insurance", detail: "Insurance document reviewed" },
  ] as const satisfies readonly { icon: LucideIcon; label: string; detail: string }[],
} as const;

export const JOB_BOARD_PREVIEW_COPY = {
  title: "Open jobs near you",
} as const;

// Page metadata [provisional] (T4 decision 18)

export const MARKETING_META = {
  home: {
    title: "Chores For Me · Your chores, done by verified local pros",
    description:
      "Post a home chore in minutes and get it done by a verified local worker: lawn care, house cleaning, item disposal and more. Pay when it's done.",
  },
  howItWorks: {
    title: "How it works · Chores For Me",
    description:
      "How Chores For Me works for customers and workers: describe the job, choose a worker or post to the board, get it done and rate.",
  },
  workers: {
    title: "Earn with Chores For Me · For workers",
    description:
      "Choose your area, choose your jobs and get paid to your payout account. Create a Chores For Me worker account.",
  },
  faq: {
    title: "FAQ · Chores For Me",
    description:
      "Answers to common questions about cancelling jobs, payment timing, payouts, registration and independent contractor status.",
  },
  privacy: {
    title: "Privacy Policy · Chores For Me",
    description: "The Chores For Me Privacy Policy for the web is being prepared.",
  },
  terms: {
    title: "Terms · Chores For Me",
    description: "The Chores For Me Terms for the web are being prepared.",
  },
} as const satisfies Record<string, { title: string; description: string }>;

/*
 * ---------------------------------------------------------------------------
 * T5: auth. Copy marked [provisional] needs client approval (T5 decision 5).
 * Text marked (verbatim) comes from the PRD or the Tech Spec.
 * ---------------------------------------------------------------------------
 */

// Auth routes

export const AUTH_ROUTES = {
  login: "/login",
  signUp: "/signup",
  forgotPassword: "/forgot-password",
} as const;

/** Each role's home (dashboard). */
export const ROLE_HOME: Record<Role, string> = {
  customer: "/dashboard",
  worker: "/worker/dashboard",
};

/**
 * Where a new account goes after sign-up when there is no `next` (T5
 * decision 9). T9 switches the worker route to `/worker/onboarding/area`.
 */
export const POST_SIGN_UP_ROUTE: Record<Role, string> = {
  customer: ROLE_HOME.customer,
  worker: ROLE_HOME.worker,
};

/** One-click password used by the Demo accounts panel (any password works). */
export const DEMO_PASSWORD = "demo1234";

/** Seconds before "Resend code" is available again (T5 decision 13). */
export const OTP_RESEND_SECONDS = 30;

// Auth copy [provisional unless marked verbatim]

const PROVIDER_NAMES: Record<SocialProvider, string> = {
  google: "Google",
  facebook: "Facebook",
};

const ROLE_NOUNS: Record<Role, string> = { customer: "customer", worker: "worker" };

export const AUTH_COPY = {
  meta: {
    login: "Log in · Chores For Me",
    signUp: "Sign up · Chores For Me",
    forgotPassword: "Reset your password · Chores For Me",
    dashboard: "Dashboard · Chores For Me",
  },
  providerName: PROVIDER_NAMES,
  roleNoun: ROLE_NOUNS,
  fields: {
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    password: "Password",
    passwordHint: "At least 8 characters, with a letter and a number.",
    showPassword: "Show password",
    hidePassword: "Hide password",
    mobile: "Mobile number",
    mobilePrefix: "+1",
    mobilePlaceholder: "(555) 123-4567",
    mobileHint: "US mobile numbers only. We'll text you a 6-digit code.",
    dob: "Date of birth",
    dobHintWorker: "Workers must be 18 or older.",
    termsLabel: "I accept the Terms and Privacy Policy",
    termsLinksLead: "Read the",
    termsLinksJoin: "and the",
  },
  login: {
    title: "Log in",
    description: "Welcome back to Chores For Me.",
    demoJump: "Use a demo account",
    forgotLink: "Forgot password?",
    submit: "Log in",
    submitting: "Logging in…",
    noAccount: "New to Chores For Me?",
    signUpLink: "Sign up",
    redirecting: "Taking you to your dashboard…",
  },
  social: {
    google: "Continue with Google",
    facebook: "Continue with Facebook",
    monogram: { google: "G", facebook: "f" } satisfies Record<SocialProvider, string>,
    divider: "or",
    /** Tech Spec pattern (verbatim): "Signing in with Google (demo)". */
    dialogTitle: (provider: SocialProvider) => `Signing in with ${PROVIDER_NAMES[provider]} (demo)`,
    dialogDescription: (provider: SocialProvider) =>
      `This is a demo. No ${PROVIDER_NAMES[provider]} account is used and nothing leaves this browser.`,
    identityLabel: "Demo identity",
    confirm: (firstName: string) => `Continue as ${firstName}`,
    confirming: "Signing in…",
    cancel: "Cancel",
    roleBody: (provider: SocialProvider) =>
      `This ${PROVIDER_NAMES[provider]} identity is new here. Choose an account type to continue.`,
    mismatchBody: (name: string, role: Role, otherRole: Role) =>
      `${name} already has a ${ROLE_NOUNS[role]} account. To create a ${ROLE_NOUNS[otherRole]} account, use a different email.`,
    signUpWithEmail: "Sign up with email instead",
    logInInstead: "Log in instead",
  },
  picker: {
    /** PRD (verbatim). */
    title: "How do you want to use Chores For Me?",
    description: "Choose one. Customer and worker accounts are separate.",
    customer: {
      /** PRD (verbatim). */
      title: "I need help with chores",
      description: "Post a job and get matched with verified local workers.",
      action: "Continue as a customer",
    },
    worker: {
      /** PRD (verbatim). */
      title: "I want to earn doing chores",
      description: "Find jobs near you and get paid for the work you choose.",
      action: "Continue as a worker",
    },
    haveAccount: "Already have an account?",
    logIn: "Log in",
  },
  signUp: {
    roleChip: { customer: "Customer account", worker: "Worker account" } satisfies Record<
      Role,
      string
    >,
    change: "Change",
    changeLabel: "Change account type",
    title: {
      customer: "Create your account",
      worker: "Create your worker account",
    } satisfies Record<Role, string>,
    description: {
      customer: "Post jobs and track them in one place.",
      worker: "Set up your account to start finding jobs near you.",
    } satisfies Record<Role, string>,
    submit: { customer: "Create account", worker: "Create worker account" } satisfies Record<
      Role,
      string
    >,
    submitting: "Creating your account…",
    haveAccount: "Already have an account?",
    logIn: "Log in",
  },
  completeProfile: {
    title: "Finish setting up your account",
    description: (provider: SocialProvider) =>
      `You signed in with ${PROVIDER_NAMES[provider]}. Add your mobile number and date of birth to finish.`,
    descriptionEmail: "Add your mobile number and date of birth to finish.",
    notYou: "Not you? Log out",
    submit: "Finish sign-up",
    submitting: "Saving…",
  },
  otp: {
    sendCode: "Send code",
    sending: "Sending…",
    sentTo: (mobile: string) => `We sent a 6-digit code to ${mobile}.`,
    resent: "We sent a new code.",
    codeLabel: "Enter the 6-digit code",
    digitLabel: (index: number) => `Digit ${index} of 6`,
    demoHint: (code: string) => `Demo code: ${code}`,
    verify: "Verify",
    verifying: "Verifying…",
    resend: "Resend code",
    resendIn: (seconds: number) => `Resend code in ${seconds}s`,
    changeNumber: "Change number",
    verified: "Mobile number verified",
  },
  forgot: {
    title: "Reset your password",
    description:
      "Enter the email you used to sign up and we'll send you a link to reset your password.",
    submit: "Send reset link",
    submitting: "Sending…",
    backToLogin: "Back to log in",
    /** Tech Spec (verbatim). */
    successTitle: "Check your email",
    /** "If an account exists for {email}, a reset link is on its way." */
    successBodyLead: "If an account exists for",
    successBodyTail: ", a reset link is on its way.",
    demoNote: "Demo only: no email is sent.",
    differentEmail: "Use a different email",
  },
  demo: {
    title: "Demo accounts",
    description: "Log in with one click. Any password works.",
    logIn: "Log in",
    logInAs: (label: string) => `Log in as ${label}`,
    loggingIn: "Logging in…",
    passwordLabel: "Password:",
    passwordValue: "Any password",
    otpLabel: "SMS code:",
  },
  separate: {
    title: SERVICE_MESSAGES.roleMismatch,
    body: {
      customer:
        "You're logged in with a customer account. To earn doing chores, create a separate worker account with a different email.",
      worker:
        "You're logged in with a worker account. To post jobs, create a separate customer account with a different email.",
    } satisfies Record<Role, string>,
    logOutAndCreate: (otherRole: Role) => `Log out and create a ${ROLE_NOUNS[otherRole]} account`,
    goToDashboard: "Go to my dashboard",
  },
  brandPanel: {
    trustTitle: "Help from verified local workers",
  },
  guard: {
    checking: "Checking your session…",
  },
  dashboard: {
    greeting: (firstName: string) => `Hi, ${firstName}`,
    roleLine: {
      customer: "You're logged in with a customer account.",
      worker: "You're logged in with a worker account.",
    } satisfies Record<Role, string>,
    comingSoon: "Dashboard coming soon",
    description: {
      customer: "Your jobs, history and account settings will appear here.",
      worker: "The job board, your jobs and earnings will appear here.",
    } satisfies Record<Role, string>,
    workerAction: LANDING_COPY.workers.secondaryLink,
  },
  account: {
    menu: "Account",
    logOut: "Log out",
    loggingOut: "Logging out…",
    logoutError: "We couldn't log you out. Try again.",
    roleLabel: { customer: "Customer account", worker: "Worker account" } satisfies Record<
      Role,
      string
    >,
    previewName: "Sample user",
  },
  header: {
    dashboard: "Dashboard",
  },
} as const;

/*
 * ---------------------------------------------------------------------------
 * T6: job builder steps 1–5. Copy is [provisional] (T6 open question 21)
 * unless marked verbatim.
 * ---------------------------------------------------------------------------
 */

// Job builder steps (PRD labels; "Step N of 8", T6 decision 1)

export type PostJobStep = { step: number; route: string; label: string };

export const POST_JOB_STEPS = [
  { step: 1, route: "/post-job/category", label: "Category" },
  { step: 2, route: "/post-job/services", label: "Services" },
  { step: 3, route: "/post-job/location", label: "Where" },
  { step: 4, route: "/post-job/details", label: "Details" },
  { step: 5, route: "/post-job/match", label: "Who" },
  { step: 6, route: "/post-job/review", label: "Review & Post" },
  { step: 7, route: "/post-job/payment", label: "Payment" },
  { step: 8, route: "/post-job/confirmation", label: "Confirmation" },
] as const satisfies readonly PostJobStep[];

/** The FAQ item's question, reused as a link label (T7). */
const faqQuestion = (id: string) => FAQ_ITEMS.find((item) => item.id === id)?.question ?? "";

const usd = (value: number) => `$${value.toLocaleString("en-US")}`;
const hoursText = (hours: number) => `${hours} ${hours === 1 ? "hour" : "hours"}`;

export const JOB_BUILDER_COPY = {
  meta: {
    category: "Post a job — Category",
    services: "Post a job — Services",
    location: "Post a job — Where",
    details: "Post a job — Details",
    match: "Post a job — Who",
    review: "Post a job — Review",
    payment: "Post a job — Payment",
    confirmation: "Post a job — Confirmation",
  },
  stepper: {
    ariaLabel: "Job progress",
    status: (step: number, total: number) => `Step ${step} of ${total}`,
    next: (label: string) => `Next: ${label}`,
    done: " (done)",
  },
  actions: {
    back: "Back",
    continue: "Continue",
    /* T7 (Edit links from Review, `?from=review`). */
    returnToReview: "Save and return to review",
  },
  summary: {
    title: "Your job",
    emptyIntro: "Your answers appear here as you go.",
    notAdded: "Not added yet",
    rows: {
      category: "Category",
      services: "Services",
      where: "Where",
      details: "Details",
      who: "Who",
    },
    otherPrefix: "Other: ",
    photoCount: (count: number) => `${count} ${count === 1 ? "photo" : "photos"}`,
    estimateLabel: "Estimated total",
    estimateEmpty: "Set a price in Details",
    hourlyBreakdown: (rate: string, hours: number) => `${rate}/hr × ${hoursText(hours)}`,
    chargeNote: "You're charged when the job is done.",
    barEstimate: (value: string) => `Est. ${value}`,
    barNoPrice: "No price yet",
    whoDirect: (name: string) => `Pick a Worker: ${name}`,
  },
  category: {
    title: "What do you need help with?",
    description: "Choose the type of chore. You can add details next.",
  },
  services: {
    title: "Which services do you need?",
    description: "Choose all that apply.",
    change: "Change",
    changeLabel: "Change category",
    otherLabel: "What's the other service?",
    otherHint: `${LIMITS.otherTextMin} to ${LIMITS.otherTextMax} characters.`,
  },
  location: {
    title: "Where is the job?",
    description: "Enter a US street address. Start typing to see suggestions.",
    line1: "Street address",
    city: "City",
    state: "State",
    statePlaceholder: "Choose a state",
    zip: "ZIP code",
    landmark: "Landmark (optional)",
    landmarkHint: "Anything that helps the worker find it, like a gate code or a blue fence.",
    suggestionsLabel: "Address suggestions",
    searching: "Searching addresses…",
    found: (count: number) =>
      `${count} ${count === 1 ? "address" : "addresses"} found. Use the up and down arrows to choose.`,
    noMatches: "No matching addresses",
    suggestError: "Suggestions aren't available — enter the address below",
    filled: (address: string) => `Address filled: ${address}`,
  },
  notify: {
    title: (state: string) => `We're not in ${state} yet`,
    body: (served: string, city: string) =>
      `Chores For Me is available in ${served} for now. Leave your email and we'll let you know when we reach ${city}.`,
    email: "Email",
    submit: "Notify me",
    submitting: "Saving…",
    success: (email: string, state: string) =>
      `Thanks! We'll email ${email} when we reach ${state}.`,
    changeAddress: "Use a different address",
  },
  details: {
    title: "Tell us about the job",
    description: "Describe the work, add photos if they help, and set your price.",
    descriptionLabel: "Describe the job",
    descriptionHint: "What needs doing, how much of it, and anything the worker should know.",
    counter: (count: number, max: number) => `${count} / ${max}`,
    counterLive: (count: number, max: number) => `${count} of ${max} characters`,
    photosLabel: "Photos (optional)",
    photosHint: `Up to ${LIMITS.photosMax} photos. JPG, PNG, HEIC or WebP, under ${
      LIMITS.fileMaxBytes / (1024 * 1024)
    } MB each.`,
    photosEmpty: "Photos help workers understand the job.",
    choosePhotos: "Choose photos",
    takePhoto: "Take photo",
    photoCount: (count: number, max: number) => `${count} of ${max} photos`,
    photoNote: "Photos stay until you reload or close this tab.",
    photoAlt: (index: number, total: number, name: string) => `Photo ${index} of ${total}: ${name}`,
    removePhoto: (index: number, name: string) => `Remove photo ${index}: ${name}`,
    photoAdded: (count: number, max: number) => `Photo added. ${count} of ${max}.`,
    photoRemoved: (count: number, max: number) => `Photo removed. ${count} of ${max}.`,
    addedPhotosLabel: "Added photos",
    photoFallbackName: "Photo",
    priceLegend: "Price",
    pricingTypeLabel: "Pricing type",
    fixedLabel: "Your price",
    fixedHint: `Between ${usd(LIMITS.fixedPriceMin)} and ${usd(LIMITS.fixedPriceMax)}.`,
    rateLabel: "Hourly rate",
    rateHint: `Between ${usd(LIMITS.hourlyRateMin)} and ${usd(LIMITS.hourlyRateMax)} an hour.`,
    hoursLabel: "Hours",
    hoursHint: `Up to ${LIMITS.hoursMax} hours, in half hours.`,
    hoursPlaceholder: "Choose hours",
    hoursOption: hoursText,
    estimateLabel: "Estimated total",
    estimateEmpty: "Add a rate and hours",
    estimateLive: (value: string) => `Estimated total ${value}`,
  },
  match: {
    title: "Who should do the job?",
    description: "Post it to the job board, or pick a verified worker yourself.",
    boardDescription: "Verified workers near you see the job. The first to accept gets it.",
    directDescription: "Choose from verified workers who serve your area.",
    workersTitle: "Choose a verified worker",
    workersCount: (count: number, city: string) =>
      `${count} verified ${count === 1 ? "worker serves" : "workers serve"} ${city}.`,
    favouritesFirst: "Your favourite workers are shown first.",
    loadingWorkers: "Loading workers…",
    emptyDescription:
      "We've switched you to the job board. Choose Pick a Worker again to check for new workers.",
    favourite: "Favourite",
    favouriteSr: "Favourite worker",
    ratingSr: " out of 5",
    jobsDone: (count: number) => `${count} ${count === 1 ? "job" : "jobs"} done`,
    badgesLabel: "Verified checks",
    badges: { phone: "Phone", id: "ID", insurance: "Insurance" },
  },
  /* T7: steps 6–8 [provisional] unless marked verbatim or reused. */
  review: {
    title: "Review your job",
    descriptionGuest: "Check the details, then create an account or log in to post it.",
    descriptionCustomer: "Check the details, then continue to payment.",
    jumpToAuth: "Create an account to continue",
    summaryTitle: "Your job",
    edit: "Edit",
    editSr: (section: string) => ` ${section.toLowerCase()}`,
    priceFixed: (value: string) => `Fixed Price · ${value}`,
    priceHourly: (breakdown: string) => `Hourly · ${breakdown}`,
    workerLoading: "Loading worker…",
    workerFallback: "your chosen worker",
    workerError: "We couldn't load the worker's details.",
    workerRetry: "Try again",
    templateLabel: "Save as template",
    templateHint: "Post this job again later from your dashboard.",
    templateNameLabel: "Template name",
    templateNameHint: `${LIMITS.templateNameMin} to ${LIMITS.templateNameMax} characters.`,
    authLead: "Create an account or log in to post your job",
    postTitle: "Ready to post your job",
    postDescription: "Next, choose how to pay. You're charged when the job is done.",
    signedInAs: "Signed in as",
    continue: "Continue to payment",
    helpTitle: "Questions?",
    helpLinks: [
      { id: "payment-timing", label: faqQuestion("payment-timing") },
      { id: "cancellation-fee", label: faqQuestion("cancellation-fee") },
    ],
  },
  payment: {
    title: "How would you like to pay?",
    description: "Choose a saved card or add a new one.",
    methodsTitle: "Payment method",
    methodsLoading: "Loading your payment methods…",
    savedCard: (brand: string, last4: string) => `${brand} ending ${last4}`,
    addNew: "Add a new card",
    addNewDescription: "Visa, Mastercard or American Express",
    noSavedTitle: "Add a card",
    noSavedIntro: "You don't have a saved card yet.",
    demoNote: "Demo only — don't enter a real card. Try 4242 4242 4242 4242.",
    numberLabel: "Card number",
    expiryLabel: "Expiry date",
    expiryHint: "MM/YY",
    cvcLabel: "Security code",
    cvcHint: "3 digits (4 for Amex)",
    estimateLabel: "Estimated total",
    charged: "You're charged when the job is done.",
    noRefunds: "There are no refunds.",
    faqLink: { id: "payment-timing", label: faqQuestion("payment-timing") },
    submit: "Post job",
    /** Tech Spec (verbatim). */
    submitting: SCREEN_STATE_COPY.postingJob,
  },
  confirmation: {
    title: "Job posted",
    description: "You can follow it from your dashboard.",
    loading: "Loading your job…",
    nextTitle: "What happens next",
    nextBoard:
      "Your job is on the job board. Verified workers near you can see it, and the first to accept gets it.",
    nextDirect: (name: string) =>
      `We've sent your job to ${name}. It shows as Accepted in your dashboard.`,
    nextUpdates: "We'll email and text you updates.",
    nextCharge: "You're charged when the job is done. There are no refunds.",
    summaryTitle: "Job summary",
    statusSr: "Status: ",
    templateSaved: (name: string) => `Saved as template “${name}”`,
    /** After a reload the name is not known (it lives on the template, not the job). */
    templateSavedNoName: "Saved as a template",
    templateSavedHint: "You'll find it in your dashboard.",
    templateOfferTitle: "Save this job as a template",
    templateOfferHint: "Post it again later from your dashboard.",
    templateSaveFailed: "We couldn't save your template. You can try again here.",
    templateSave: "Save template",
    templateSaving: "Saving…",
    postAnother: "Post another job",
    notFoundDescription: "The link may be wrong, or the job belongs to another account.",
    postJob: "Post a job",
    promptHidden: "Hidden for 7 days.",
  },
} as const;

/** Card brand names (T7). Never more than the brand and the last 4 digits are shown. */
export const CARD_BRAND_LABELS: Record<CardBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
};

/** App hand-off prompt (T7; T11 adds the worker entry). */
export const APP_PROMPT_COPY = {
  customer: {
    /** PRD (verbatim). */
    androidTitle: "Get notified the moment a worker accepts — install the app",
    androidBody: "The Chores For Me app is free on Google Play.",
    install: "Get it on Google Play",
    /** PRD (verbatim). */
    updates: "We'll email and text you updates",
  },
  dismiss: "Dismiss for 7 days",
  /** Days a dismissed prompt stays hidden (PRD). */
  dismissDays: 7,
} as const;

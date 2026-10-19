import {
  BriefcaseBusiness,
  ClipboardList,
  History,
  House,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { Role } from "@/lib/types";

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

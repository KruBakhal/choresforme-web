/*
 * Display data for /styleguide. The hex strings here only document the values
 * in src/styles/globals.css; they are never used as styles.
 * Class names are written out in full so Tailwind can find them.
 */

export type SwatchData = {
  token: string;
  hex: string;
  use: string;
  /** Classes for the colour block. */
  blockClass: string;
  /** Approved text pairing (Tech Spec contrast table), if the token carries text. */
  pairing?: { chipClass: string; ratio: string };
  /** Shown when the token has no text pairing. */
  note?: string;
};

export const SWATCHES: readonly SwatchData[] = [
  {
    token: "--brand",
    hex: "#00ABF6",
    use: "Fills only: primary buttons, logo tile, CTA bar, decorative accents.",
    blockClass: "bg-brand",
    pairing: { chipClass: "bg-brand text-brand-foreground", ratio: "4.9:1" },
  },
  {
    token: "--brand-foreground",
    hex: "#333333",
    use: "Text and icons on brand fills.",
    blockClass: "bg-brand-foreground",
    pairing: { chipClass: "bg-brand text-brand-foreground", ratio: "4.9:1" },
  },
  {
    token: "--brand-soft",
    hex: "#C7DAF5",
    use: "Secondary buttons, active nav item, icon discs.",
    blockClass: "bg-brand-soft",
    pairing: { chipClass: "bg-brand-soft text-ink", ratio: "8.9:1" },
  },
  {
    token: "--ink",
    hex: "#333333",
    use: "Body text, headings, links and the focus ring.",
    blockClass: "bg-ink",
    pairing: { chipClass: "bg-surface text-ink", ratio: "12.6:1" },
  },
  {
    token: "--ink-muted",
    hex: "#4D4F52",
    use: "Secondary text, inactive nav, input outlines.",
    blockClass: "bg-ink-muted",
    pairing: { chipClass: "bg-surface text-ink-muted", ratio: "8.2:1" },
  },
  {
    token: "--surface",
    hex: "#FFFFFF",
    use: "Page and card background.",
    blockClass: "bg-surface",
    pairing: { chipClass: "bg-surface text-ink", ratio: "12.6:1" },
  },
  {
    token: "--surface-alt",
    hex: "#F4F4F4",
    use: "Section bands and the dashboard background.",
    blockClass: "bg-surface-alt",
    pairing: { chipClass: "bg-surface-alt text-ink", ratio: "11.5:1" },
  },
  {
    token: "--surface-dark",
    hex: "#333333",
    use: "Dark accent band and the footer.",
    blockClass: "bg-surface-dark",
    pairing: { chipClass: "bg-surface-dark text-surface", ratio: "12.6:1" },
  },
  {
    token: "--border",
    hex: "#DDDDDD",
    use: "Decorative dividers and card edges.",
    blockClass: "bg-border",
    note: "Not for text or input outlines.",
  },
  {
    token: "--success",
    hex: "#16A34A",
    use: "Status icons (16 px or larger) next to a text label.",
    blockClass: "bg-success",
    note: "Not for small text (3.3:1 on white).",
  },
  {
    token: "--warning",
    hex: "#D97706",
    use: "Status icons (16 px or larger) next to a text label.",
    blockClass: "bg-warning",
    note: "Not for small text (3.2:1 on white).",
  },
  {
    token: "--danger",
    hex: "#DC2626",
    use: "Errors, error icons and destructive buttons.",
    blockClass: "bg-danger",
    pairing: { chipClass: "bg-danger text-surface", ratio: "4.8:1" },
  },
];

export const ALIASES: readonly { alias: string; token: string }[] = [
  { alias: "--background", token: "--surface" },
  { alias: "--foreground", token: "--ink" },
  { alias: "--card", token: "--surface" },
  { alias: "--card-foreground", token: "--ink" },
  { alias: "--popover", token: "--surface" },
  { alias: "--popover-foreground", token: "--ink" },
  { alias: "--primary", token: "--brand" },
  { alias: "--primary-foreground", token: "--brand-foreground" },
  { alias: "--secondary", token: "--brand-soft" },
  { alias: "--secondary-foreground", token: "--ink" },
  { alias: "--muted", token: "--surface-alt" },
  { alias: "--muted-foreground", token: "--ink-muted" },
  { alias: "--accent", token: "--surface-alt" },
  { alias: "--accent-foreground", token: "--ink" },
  { alias: "--destructive", token: "--danger" },
  { alias: "--border", token: "--border (same variable)" },
  { alias: "--input", token: "--ink-muted" },
  { alias: "--ring", token: "--ink" },
  { alias: "--radius", token: "--radius-md" },
];

export const TYPE_SCALE: readonly { name: string; spec: string; className: string }[] = [
  {
    name: "h1",
    spec: "44 px (32 on mobile) · text-h2 md:text-h1",
    className: "text-h2 md:text-h1 font-semibold",
  },
  { name: "h2", spec: "32 px · text-h2", className: "text-h2 font-semibold" },
  { name: "h3", spec: "24 px · text-h3", className: "text-h3 font-semibold" },
  { name: "h4", spec: "20 px · text-h4", className: "text-h4 font-semibold" },
  { name: "body", spec: "16 px · text-body", className: "text-body" },
  { name: "body-sm", spec: "14 px · text-body-sm", className: "text-body-sm" },
  { name: "caption", spec: "12 px · text-caption", className: "text-caption" },
];

export const WEIGHTS: readonly { label: string; className: string }[] = [
  { label: "Regular 400 · font-normal", className: "font-normal" },
  { label: "Semibold 600 · font-semibold", className: "font-semibold" },
];

export const FONT_FAMILY = "Poppins (next/font/google), then system-ui, sans-serif";

export const SPACING: readonly { step: string; px: number; barClass: string }[] = [
  { step: "1", px: 4, barClass: "w-1" },
  { step: "2", px: 8, barClass: "w-2" },
  { step: "3", px: 12, barClass: "w-3" },
  { step: "4", px: 16, barClass: "w-4" },
  { step: "6", px: 24, barClass: "w-6" },
  { step: "8", px: 32, barClass: "w-8" },
  { step: "12", px: 48, barClass: "w-12" },
  { step: "16", px: 64, barClass: "w-16" },
  { step: "24", px: 96, barClass: "w-24" },
];

export const RADII: readonly { name: string; px: number; className: string }[] = [
  { name: "rounded-sm", px: 8, className: "rounded-sm" },
  { name: "rounded-md", px: 12, className: "rounded-md" },
  { name: "rounded-lg", px: 20, className: "rounded-lg" },
];

export const BREAKPOINTS: readonly { name: string; value: string }[] = [
  { name: "sm", value: "640 px" },
  { name: "md", value: "768 px (tablet)" },
  { name: "lg", value: "1024 px (desktop)" },
  { name: "xl", value: "1280 px (reference width)" },
  { name: "max-w-content", value: "1200 px content max width" },
];

export const BUTTON_VARIANTS = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "link",
  "destructive",
] as const;

export const BUTTON_SIZES = ["sm", "default", "lg"] as const;

export const BUTTON_LABELS = {
  sm: "Small",
  default: "Default",
  lg: "Large",
  icon: "Icon button",
  disabled: "Disabled",
} as const;

export const SECTIONS = [
  { id: "brand", key: "brand" },
  { id: "colours", key: "colours" },
  { id: "typography", key: "typography" },
  { id: "spacing", key: "spacing" },
  { id: "primitives", key: "primitives" },
  { id: "header-footer", key: "headerFooter" },
  { id: "app-shell", key: "appShell" },
  { id: "states", key: "states" },
] as const;

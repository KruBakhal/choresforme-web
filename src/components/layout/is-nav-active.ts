import type { NavItem } from "@/lib/constants";

/** `exact` items match only their own path; `prefix` items also match sub-paths. */
export function isNavActive(pathname: string, item: Pick<NavItem, "href" | "match">): boolean {
  if (pathname === item.href) return true;
  return item.match === "prefix" && pathname.startsWith(`${item.href}/`);
}

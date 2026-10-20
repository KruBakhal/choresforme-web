import { AUTH_ROUTES, POST_SIGN_UP_ROUTE, ROLE_HOME } from "@/lib/constants";
import type { Role, User } from "@/lib/types";

/*
 * Auth redirect helpers (T5). Pure functions, safe on the server and the
 * client. `next` is only ever used when it is a same-site path.
 */

const ROLES: readonly Role[] = ["customer", "worker"];

/** A valid `?role=` value, or null (invalid values show the picker, decision 8). */
export function parseRole(value: string | null | undefined): Role | null {
  return ROLES.includes(value as Role) ? (value as Role) : null;
}

export function otherRole(role: Role): Role {
  return role === "customer" ? "worker" : "customer";
}

/** The role's dashboard. */
export function dashboardFor(role: Role): string {
  return ROLE_HOME[role];
}

/** Same-site paths only: "/x" yes; "//x", "/\x", "https://…" and empty no. */
export function safeNext(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/")) return null;
  if (value.startsWith("//") || value.startsWith("/\\")) return null;
  return value;
}

/** A new social user is incomplete until mobile and date of birth are set (decision 4). */
export function isProfileComplete(user: Pick<User, "mobile" | "dob">): boolean {
  return user.mobile.trim() !== "" && user.dob.trim() !== "";
}

/** The query params carried between login, sign-up and the picker: `next` and `utm_*` (decision 10). */
export function keptParams(params: URLSearchParams | null | undefined): URLSearchParams {
  const kept = new URLSearchParams();
  if (!params) return kept;
  params.forEach((value, key) => {
    if (key === "next" || key.startsWith("utm_")) kept.append(key, value);
  });
  return kept;
}

function withParams(path: string, params: URLSearchParams): string {
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function loginHref(next?: string | null, kept?: URLSearchParams): string {
  const params = new URLSearchParams(kept);
  const safe = safeNext(next ?? params.get("next"));
  params.delete("next");
  if (safe) params.set("next", safe);
  return withParams(AUTH_ROUTES.login, params);
}

/** `/signup` (the picker) or `/signup?role=…`, keeping `next` and `utm_*`. */
export function signUpHref(role: Role | null, kept?: URLSearchParams): string {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  kept?.forEach((value, key) => params.append(key, value));
  return withParams(AUTH_ROUTES.signUp, params);
}

export function forgotPasswordHref(kept?: URLSearchParams): string {
  return withParams(AUTH_ROUTES.forgotPassword, new URLSearchParams(kept));
}

/**
 * Where a signed-in user goes next: the complete-profile form when the
 * profile is incomplete, otherwise `next` or the role's home. `afterSignUp`
 * uses the post-sign-up route (decision 9).
 */
export function routeAfterAuth(
  user: Pick<User, "role" | "mobile" | "dob">,
  next: string | null | undefined,
  options: { afterSignUp?: boolean; kept?: URLSearchParams } = {},
): string {
  const safe = safeNext(next);
  if (!isProfileComplete(user)) {
    // Keep `utm_*` from the current page, and only a safe `next`.
    const kept = new URLSearchParams(options.kept);
    kept.delete("next");
    if (safe) kept.set("next", safe);
    return signUpHref(user.role, kept);
  }
  if (safe) return safe;
  return options.afterSignUp ? POST_SIGN_UP_ROUTE[user.role] : dashboardFor(user.role);
}

/*
 * Logout destination. When a guarded page logs out, the guard sees the session
 * disappear before the logout button navigates; it reads this so both send
 * the user to the same place instead of `/login?next=…`. The logout button
 * sets it just before logging out and clears it once it has navigated.
 */
let logoutDestination: string | null = null;

export function setLogoutDestination(href: string | null): void {
  logoutDestination = href;
}

export function getLogoutDestination(): string | null {
  return logoutDestination;
}

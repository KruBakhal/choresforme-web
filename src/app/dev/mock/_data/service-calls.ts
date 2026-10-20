import { DEV_MOCK_COPY } from "@/lib/constants";
import {
  addresses,
  auth,
  earnings,
  favourites,
  jobs,
  notify,
  payments,
  templates,
  users,
  workers,
} from "@/lib/mock/services";
import type { Address, JobDraft, SignUpInput } from "@/lib/types";

/*
 * Fixed sample arguments for every mock service (dev page only). Ids are the
 * seed's public ids, passed as arguments; the seed itself is never imported.
 */

export type ServiceCallDef = {
  id: keyof typeof DEV_MOCK_COPY.calls;
  name: string;
  argsLabel: string;
  expectLabel?: string;
  run: () => Promise<unknown>;
};

export type ServiceGroupId = keyof typeof DEV_MOCK_COPY.groups;

export type ServiceGroupDef = {
  id: ServiceGroupId;
  title: string;
  intro?: string;
  calls: ServiceCallDef[];
};

const DEMO_CUSTOMER = "cust-demo";
const NEW_CUSTOMER = "cust-new";
const DEMO_WORKER = "wrk-demo";
const HOUSTON_WORKER = "wrk-003";
const UNDER_REVIEW_WORKER = "wrk-005";
const REJECTED_WORKER = "wrk-006";
const SAMPLE_MOBILE = "+15125550101";

const AUSTIN: Address = { line1: "1208 S Lamar Blvd", city: "Austin", state: "TX", zip: "78704" };
const DENVER: Address = { line1: "1600 Glenarm Pl", city: "Denver", state: "CO", zip: "80202" };

const NEW_WORKER: SignUpInput = {
  role: "worker",
  firstName: "Riley",
  lastName: "Chen",
  email: "new.worker@choresforme.test",
  password: "demo1234",
  mobile: "+15125550142",
  dob: "1997-08-19",
  terms: true,
};

const SAMPLE_DRAFT: JobDraft = {
  category: "outdoor",
  subServices: ["Lawn Mowing"],
  address: { line1: "201 W 5th St", city: "Austin", state: "TX", zip: "78701" },
  description: "Mow the front lawn and bag the clippings.",
  photos: [],
  pricingType: "fixed",
  amount: 90,
  matchType: "board",
  savedAsTemplate: false,
  lastStep: 6,
};

function call(id: ServiceCallDef["id"], name: string, run: ServiceCallDef["run"]): ServiceCallDef {
  const copy: { argsLabel: string; expectLabel?: string } = DEV_MOCK_COPY.calls[id];
  return { id, name, argsLabel: copy.argsLabel, expectLabel: copy.expectLabel, run };
}

function group(id: ServiceGroupId, calls: ServiceCallDef[]): ServiceGroupDef {
  const copy: { title: string; intro?: string } = DEV_MOCK_COPY.groups[id];
  return { id, title: copy.title, intro: copy.intro, calls };
}

export const SERVICE_GROUPS: readonly ServiceGroupDef[] = [
  group("auth", [
    call("loginCustomer", "auth.login", () =>
      auth.login("demo.customer@choresforme.test", "any-password"),
    ),
    call("loginWorker", "auth.login", () =>
      auth.login("demo.worker@choresforme.test", "any-password"),
    ),
    call("loginUnknown", "auth.login", () => auth.login("nobody@choresforme.test", "any-password")),
    call("signUpWorker", "auth.signUp", () => auth.signUp(NEW_WORKER)),
    call("signUpExisting", "auth.signUp", () =>
      auth.signUp({
        ...NEW_WORKER,
        role: "customer",
        email: "demo.customer@choresforme.test",
      }),
    ),
    call("loginGoogle", "auth.loginWithProvider", () =>
      auth.loginWithProvider("google", "customer"),
    ),
    call("loginFacebook", "auth.loginWithProvider", () =>
      auth.loginWithProvider("facebook", "worker"),
    ),
    call("sendOtp", "auth.sendOtp", () => auth.sendOtp(SAMPLE_MOBILE)),
    call("verifyOtpRight", "auth.verifyOtp", () => auth.verifyOtp(SAMPLE_MOBILE, "123456")),
    call("verifyOtpWrong", "auth.verifyOtp", () => auth.verifyOtp(SAMPLE_MOBILE, "000000")),
    call("passwordReset", "auth.requestPasswordReset", () =>
      auth.requestPasswordReset("demo.customer@choresforme.test"),
    ),
    call("logout", "auth.logout", () => auth.logout()),
  ]),
  group("jobs", [
    call("listForCustomer", "jobs.listForCustomer", () => jobs.listForCustomer(DEMO_CUSTOMER)),
    call("listForCustomerNew", "jobs.listForCustomer", () => jobs.listForCustomer(NEW_CUSTOMER)),
    call("listBoard", "jobs.listBoard", () => jobs.listBoard(DEMO_WORKER)),
    call("listForWorker", "jobs.listForWorker", () => jobs.listForWorker(DEMO_WORKER)),
    call("getJob", "jobs.get", () => jobs.get("job-001")),
    call("getJobMissing", "jobs.get", () => jobs.get("job-missing")),
    call("createJob", "jobs.create", () => jobs.create(SAMPLE_DRAFT)),
    call("accept", "jobs.accept", () => jobs.accept("job-003", DEMO_WORKER)),
    call("acceptUnverified", "jobs.accept", () => jobs.accept("job-001", UNDER_REVIEW_WORKER)),
    call("updateJob", "jobs.update", () =>
      jobs.update("job-005", {
        description: "Plant six shrubs and two small trees along the front walkway.",
      }),
    ),
    call("cancel", "jobs.cancel", () => jobs.cancel("job-004")),
    call("start", "jobs.start", () => jobs.start("job-006")),
    call("complete", "jobs.complete", () => jobs.complete("job-009")),
    call("rate", "jobs.rate", () => jobs.rate("job-011", 5)),
  ]),
  group("workers", [
    call("listForArea", "workers.listForArea", () => workers.listForArea(AUSTIN, "outdoor")),
    call("listForAreaEmpty", "workers.listForArea", () => workers.listForArea(DENVER, "outdoor")),
    call("getProfile", "workers.getProfile", () => workers.getProfile(DEMO_WORKER)),
    call("getProfileRejected", "workers.getProfile", () => workers.getProfile(REJECTED_WORKER)),
    call("approve", "workers.updateOnboarding", () =>
      workers.updateOnboarding(UNDER_REVIEW_WORKER, {
        idStatus: "verified",
        insuranceStatus: "verified",
      }),
    ),
    call("uploadDocument", "workers.uploadDocument", () =>
      workers.uploadDocument(
        REJECTED_WORKER,
        "id_front",
        new File(["demo"], "id-front.png", { type: "image/png" }),
      ),
    ),
  ]),
  group("templates", [
    call("listTemplates", "templates.list", () => templates.list(DEMO_CUSTOMER)),
    call("listTemplatesNew", "templates.list", () => templates.list(NEW_CUSTOMER)),
    call("saveTemplate", "templates.save", () =>
      templates.save(DEMO_CUSTOMER, "Monthly gutter clean", {
        ...SAMPLE_DRAFT,
        subServices: ["Gutter Service"],
        description: "Clean out the gutters and check the downspouts.",
      }),
    ),
  ]),
  group("payments", [
    call("listMethods", "payments.listMethods", () => payments.listMethods(DEMO_CUSTOMER)),
    call("listMethodsNew", "payments.listMethods", () => payments.listMethods(NEW_CUSTOMER)),
    call("addMethod", "payments.addMethod", () =>
      payments.addMethod(NEW_CUSTOMER, { number: "5555555555554444", expiry: "12/30", cvc: "123" }),
    ),
  ]),
  group("earnings", [call("earnings", "earnings.summary", () => earnings.summary(DEMO_WORKER))]),
  group("users", [
    call("updateUser", "users.update", () =>
      users.update(NEW_CUSTOMER, { mobile: "+15125550199" }),
    ),
  ]),
  group("addresses", [
    call("suggest", "addresses.suggest", () => addresses.suggest("Austin")),
    call("suggestEmpty", "addresses.suggest", () => addresses.suggest("zzz")),
  ]),
  group("notify", [
    call("capture", "notify.capture", () =>
      notify.capture("new.customer@choresforme.test", DENVER),
    ),
  ]),
  group("favourites", [
    call("listFavourites", "favourites.list", () => favourites.list(DEMO_CUSTOMER)),
    call("listFavouritesNew", "favourites.list", () => favourites.list(NEW_CUSTOMER)),
    call("toggleFavourite", "favourites.toggle", () =>
      favourites.toggle(DEMO_CUSTOMER, HOUSTON_WORKER),
    ),
  ]),
];

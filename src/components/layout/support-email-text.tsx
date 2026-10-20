import { SUPPORT_EMAIL } from "@/lib/constants";

const [user, domain] = SUPPORT_EMAIL.split("@");

/** The support email with a line-break opportunity after the "@", so it never wraps mid-word. */
export function SupportEmailText() {
  return (
    <>
      {user}@<wbr />
      {domain}
    </>
  );
}

import { AuthHeader } from "@/components/auth/auth-header";
import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";

/*
 * Auth shell (T5): minimal header, the page, and the full Footer (Reset demo
 * data, Terms and Privacy, support) without the mobile "Post a job" bar, which
 * would cover the form's submit button.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AuthHeader />
      <main id="main" tabIndex={-1} className="flex-1 bg-surface outline-none">
        <Container className="py-8 md:py-12 lg:py-16">{children}</Container>
      </main>
      <Footer showMobileCta={false} />
    </>
  );
}

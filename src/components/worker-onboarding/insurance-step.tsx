"use client";

import * as React from "react";
import { FileText } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";

import { DocumentUploadField } from "@/components/forms/document-upload-field";
import { focusFirstError } from "@/components/forms/focus-first-error";
import { FormAlert, nextAlertKey } from "@/components/forms/form-alert";
import { DocumentStatusPanel } from "@/components/worker-onboarding/document-status-panel";
import { useOnboarding } from "@/components/worker-onboarding/onboarding-context";
import { OnboardingStepLayout } from "@/components/worker-onboarding/onboarding-step-layout";
import { SeeJobsLink, SkipRow } from "@/components/worker-onboarding/step-links";
import { useDocumentUploads } from "@/components/worker-onboarding/use-document-uploads";
import { useOnboardingNavigation } from "@/components/worker-onboarding/use-onboarding-navigation";
import { DOCUMENT_MIME_TYPES, WORKER_ONBOARDING_COPY } from "@/lib/constants";
import { workers } from "@/lib/mock/services";
import { useOnboardingStore } from "@/lib/store";
import type { VerificationStatus } from "@/lib/types";
import { documentFileSchemas, insuranceSchema, zodResolver } from "@/lib/validation";
import { isDocumentSubmitted, onboardingStepRoute } from "@/lib/worker-onboarding";

type Values = z.input<typeof insuranceSchema>;
type Output = z.output<typeof insuranceSchema>;

const TITLE_ID = "insurance-title";
const ROWS = ["document"] as const;
const FIELD_ORDER = ["document"] as const satisfies readonly (keyof Values)[];
const COPY = WORKER_ONBOARDING_COPY.insurance;
const ACTIONS = WORKER_ONBOARDING_COPY.actions;
const PANEL = WORKER_ONBOARDING_COPY.statusPanel;

const asFile = (value: unknown) => (value instanceof File ? value : null);

function panelMessage(status: VerificationStatus): string {
  if (status === "verified") return PANEL.insuranceVerified;
  if (status === "rejected") return PANEL.insuranceReupload;
  return PANEL.insuranceUnderReview;
}

/**
 * Insurance (Step 4 of 4): one document, image or PDF. "Submit for review"
 * uploads it as one row; it then shows "Under review". A saved status shows
 * instead of the upload controls, except `rejected`.
 */
export function InsuranceStep() {
  const { user, profile, setProfile } = useOnboarding();
  const go = useOnboardingNavigation();
  const markStepComplete = useOnboardingStore((state) => state.markStepComplete);
  const [openedWith] = React.useState(profile.insuranceStatus);
  const showPanel = openedWith !== "not_started";
  const showUploads = openedWith === "not_started" || openedWith === "rejected";

  const uploads = useDocumentUploads(ROWS);
  const [uploading, setUploading] = React.useState(false);
  const [successKey, setSuccessKey] = React.useState<number | null>(null);
  const retryRef = React.useRef<HTMLButtonElement | null>(null);
  /** Retry takes focus once a failed upload has rendered. */
  const pendingRetryFocus = React.useRef(false);

  const form = useForm<Values, unknown, Output>({
    resolver: zodResolver(insuranceSchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: { document: null },
  });

  React.useEffect(() => {
    if (uploading || !pendingRetryFocus.current || !retryRef.current) return;
    pendingRetryFocus.current = false;
    retryRef.current.focus();
  }, [uploading, uploads.rows]);

  const sentThisVisit = uploads.rows.document.state === "done";
  const canContinue = sentThisVisit || isDocumentSubmitted(openedWith);

  async function upload(file: File) {
    if (uploading) return;
    setUploading(true);
    const result = await uploads.run("document", () =>
      workers.uploadDocument(user.id, "insurance", file),
    );
    setUploading(false);
    if (!result.ok) {
      pendingRetryFocus.current = true;
      return;
    }
    setProfile({
      ...profile,
      insuranceStatus: result.status,
      rejectionReason: profile.idStatus === "rejected" ? profile.rejectionReason : undefined,
    });
    markStepComplete(user.id, "insurance");
    setSuccessKey(nextAlertKey());
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (canContinue) {
      event.preventDefault();
      go(onboardingStepRoute("payout"));
      return;
    }
    void form.handleSubmit(
      (output) => upload(output.document),
      focusFirstError(FIELD_ORDER, form.setFocus),
    )(event);
  }

  return (
    <OnboardingStepLayout
      titleId={TITLE_ID}
      title={COPY.title}
      description={COPY.description}
      afterDescription={<SeeJobsLink />}
      onSubmit={onSubmit}
      onBack={() => go(onboardingStepRoute("id"))}
      backDisabled={uploading}
      loading={uploading}
      continueLabel={
        canContinue ? ACTIONS.continue : uploading ? ACTIONS.uploading : ACTIONS.submitForReview
      }
    >
      {showPanel && (
        <DocumentStatusPanel
          id="insurance-status"
          title={PANEL.insuranceTitle}
          status={profile.insuranceStatus}
          reason={profile.rejectionReason}
          message={panelMessage(profile.insuranceStatus)}
        />
      )}

      {showUploads && (
        <Controller
          control={form.control}
          name="document"
          render={({ field, fieldState }) => (
            <DocumentUploadField
              ref={field.ref}
              retryRef={retryRef}
              id="insurance"
              label={COPY.label}
              hint={COPY.hint}
              prompt={COPY.prompt}
              icon={FileText}
              accept={DOCUMENT_MIME_TYPES}
              fileSchema={documentFileSchemas.insurance}
              value={asFile(field.value)}
              onChange={(file) => {
                uploads.reset("document");
                field.onChange(file);
              }}
              error={fieldState.error?.message}
              disabled={uploading}
              upload={{
                ...uploads.rows.document,
                onRetry: () => {
                  const file = asFile(form.getValues("document"));
                  if (file) void upload(file);
                },
              }}
            />
          )}
        />
      )}

      {sentThisVisit && successKey !== null && (
        <FormAlert
          key={successKey}
          tone="success"
          title={COPY.successTitle}
          message={COPY.success}
        />
      )}

      {!canContinue && (
        <SkipRow note={COPY.skipNote} href={onboardingStepRoute("payout")} disabled={uploading} />
      )}
    </OnboardingStepLayout>
  );
}

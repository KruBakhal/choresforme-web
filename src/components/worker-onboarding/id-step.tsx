"use client";

import * as React from "react";
import { CreditCard, IdCard as IdCardIcon, Info, UserRound } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";

import { DocumentUploadField } from "@/components/forms/document-upload-field";
import { focusFirstError } from "@/components/forms/focus-first-error";
import { FormAlert, nextAlertKey } from "@/components/forms/form-alert";
import { DocumentStatusPanel } from "@/components/worker-onboarding/document-status-panel";
import { useOnboarding } from "@/components/worker-onboarding/onboarding-context";
import { OnboardingStepLayout } from "@/components/worker-onboarding/onboarding-step-layout";
import {
  rememberedProfilePhoto,
  rememberProfilePhoto,
} from "@/components/worker-onboarding/profile-photo-memory";
import { SeeJobsLink, SkipRow } from "@/components/worker-onboarding/step-links";
import { useDocumentUploads } from "@/components/worker-onboarding/use-document-uploads";
import { useOnboardingNavigation } from "@/components/worker-onboarding/use-onboarding-navigation";
import { PHOTO_MIME_TYPES, WORKER_ONBOARDING_COPY } from "@/lib/constants";
import { workers } from "@/lib/mock/services";
import { useOnboardingStore } from "@/lib/store";
import type { DocumentKind, VerificationStatus } from "@/lib/types";
import {
  documentFileSchemas,
  idDocumentsSchema,
  photoFileSchema,
  zodResolver,
} from "@/lib/validation";
import { isDocumentSubmitted, onboardingStepRoute } from "@/lib/worker-onboarding";

type Values = z.input<typeof idDocumentsSchema>;
type Output = z.output<typeof idDocumentsSchema>;
type Side = "idFront" | "idBack";

const TITLE_ID = "id-title";
const SIDES = ["idFront", "idBack"] as const satisfies readonly Side[];
const KINDS: Record<Side, DocumentKind> = { idFront: "id_front", idBack: "id_back" };
const FIELD_IDS: Record<Side, string> = { idFront: "id-front", idBack: "id-back" };
const FIELD_ORDER = [
  "idFront",
  "idBack",
  "profilePhoto",
] as const satisfies readonly (keyof Values)[];
const COPY = WORKER_ONBOARDING_COPY.id;
const ACTIONS = WORKER_ONBOARDING_COPY.actions;
const PANEL = WORKER_ONBOARDING_COPY.statusPanel;

const asFile = (value: unknown) => (value instanceof File ? value : null);

function panelMessage(status: VerificationStatus): string {
  if (status === "verified") return PANEL.idVerified;
  if (status === "rejected") return PANEL.idReupload;
  return PANEL.idUnderReview;
}

/**
 * Verify ID (Step 3 of 4): front and back of a photo ID (both required,
 * each labelled) and an optional profile photo kept on this device for the
 * ID-Card. "Submit for review" uploads each side as its own row; the ID
 * goes "Under review" once both sides are in (T9 decision 2). A saved
 * status shows instead of the upload controls, except `rejected`.
 */
export function IdStep() {
  const { user, profile, setProfile } = useOnboarding();
  const go = useOnboardingNavigation();
  const markStepComplete = useOnboardingStore((state) => state.markStepComplete);
  // The layout follows the status the step opened with; the live profile drives the panel.
  const [openedWith] = React.useState(profile.idStatus);
  const showPanel = openedWith !== "not_started";
  const showUploads = openedWith === "not_started" || openedWith === "rejected";

  const uploads = useDocumentUploads(SIDES);
  const [uploading, setUploading] = React.useState(false);
  const [successKey, setSuccessKey] = React.useState<number | null>(null);
  const retryRefs = React.useRef<Record<Side, HTMLButtonElement | null>>({
    idFront: null,
    idBack: null,
  });
  /** The failed row whose Retry takes focus once the round has rendered. */
  const pendingRetryFocus = React.useRef<Side | null>(null);

  const form = useForm<Values, unknown, Output>({
    resolver: zodResolver(idDocumentsSchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {
      idFront: null,
      idBack: null,
      profilePhoto: rememberedProfilePhoto(user.id),
    },
  });

  React.useEffect(() => {
    const side = pendingRetryFocus.current;
    const target = side ? retryRefs.current[side] : null;
    if (uploading || !target) return;
    pendingRetryFocus.current = null;
    target.focus();
  }, [uploading, uploads.rows]);

  const sentThisVisit = SIDES.every((side) => uploads.rows[side].state === "done");
  const canContinue = sentThisVisit || isDocumentSubmitted(openedWith);
  const oneSideIn = !sentThisVisit && SIDES.some((side) => uploads.rows[side].state === "done");

  /** After an upload round or a retry: success, or focus on the first failed row. */
  function settle(statuses: VerificationStatus[]) {
    if (SIDES.every((side) => uploads.stateOf(side) === "done")) {
      const idStatus = statuses.includes("under_review") ? "under_review" : profile.idStatus;
      setProfile({
        ...profile,
        idStatus,
        rejectionReason:
          profile.insuranceStatus === "rejected" ? profile.rejectionReason : undefined,
      });
      markStepComplete(user.id, "id");
      setSuccessKey(nextAlertKey());
      return;
    }
    const failed = SIDES.find((side) => uploads.stateOf(side) === "failed");
    if (failed) pendingRetryFocus.current = failed;
  }

  async function uploadSides(sides: readonly Side[], files: Record<Side, File | null>) {
    setUploading(true);
    const results = await Promise.all(
      sides.map((side) => {
        const file = files[side];
        return file
          ? uploads.run(side, () => workers.uploadDocument(user.id, KINDS[side], file))
          : Promise.resolve({ ok: false } as const);
      }),
    );
    setUploading(false);
    settle(results.flatMap((result) => (result.ok ? [result.status] : [])));
  }

  function onValid(output: Output) {
    if (uploading) return;
    const pending = SIDES.filter((side) => uploads.stateOf(side) !== "done");
    void uploadSides(pending, { idFront: output.idFront, idBack: output.idBack });
  }

  function retry(side: Side) {
    if (uploading) return;
    void uploadSides([side], {
      idFront: asFile(form.getValues("idFront")),
      idBack: asFile(form.getValues("idBack")),
    });
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (canContinue) {
      event.preventDefault();
      go(onboardingStepRoute("insurance"));
      return;
    }
    void form.handleSubmit(onValid, focusFirstError(FIELD_ORDER, form.setFocus))(event);
  }

  const sideCopy: Record<Side, { label: string; prompt: string; icon: typeof IdCardIcon }> = {
    idFront: { label: COPY.front, prompt: COPY.frontPrompt, icon: IdCardIcon },
    idBack: { label: COPY.back, prompt: COPY.backPrompt, icon: CreditCard },
  };

  return (
    <OnboardingStepLayout
      titleId={TITLE_ID}
      title={COPY.title}
      description={COPY.description}
      afterDescription={<SeeJobsLink />}
      onSubmit={onSubmit}
      onBack={() => go(onboardingStepRoute("services"))}
      backDisabled={uploading}
      loading={uploading}
      continueLabel={
        canContinue ? ACTIONS.continue : uploading ? ACTIONS.uploading : ACTIONS.submitForReview
      }
    >
      {showPanel && (
        <DocumentStatusPanel
          id="id-status"
          title={PANEL.idTitle}
          status={profile.idStatus}
          reason={profile.rejectionReason}
          message={panelMessage(profile.idStatus)}
        />
      )}

      {showUploads && (
        <section aria-labelledby="id-photo-title">
          <h2 id="id-photo-title" className="text-h4 font-semibold text-ink">
            {COPY.photoIdHeading}
          </h2>
          <p className="mt-1 text-body-sm text-ink-muted">{COPY.photoIdHint}</p>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {SIDES.map((side) => (
              <Controller
                key={side}
                control={form.control}
                name={side}
                render={({ field, fieldState }) => (
                  <DocumentUploadField
                    ref={field.ref}
                    retryRef={(element) => {
                      retryRefs.current[side] = element;
                    }}
                    id={FIELD_IDS[side]}
                    label={sideCopy[side].label}
                    hint={COPY.fileHint}
                    prompt={sideCopy[side].prompt}
                    icon={sideCopy[side].icon}
                    accept={PHOTO_MIME_TYPES}
                    fileSchema={documentFileSchemas[KINDS[side] as "id_front" | "id_back"]}
                    value={asFile(field.value)}
                    onChange={(file) => {
                      uploads.reset(side);
                      field.onChange(file);
                    }}
                    error={fieldState.error?.message}
                    disabled={uploading}
                    upload={{
                      ...uploads.rows[side],
                      onRetry: () => retry(side),
                    }}
                  />
                )}
              />
            ))}
          </div>
          {oneSideIn && (
            <p className="mt-4 flex items-start gap-2 text-body-sm text-ink">
              <Info className="size-4 shrink-0" aria-hidden />
              {COPY.partialNote}
            </p>
          )}
        </section>
      )}

      <section aria-labelledby="profile-photo-title">
        <h2 id="profile-photo-title" className="text-h4 font-semibold text-ink">
          {COPY.profileHeading}
        </h2>
        <p className="mt-1 text-body-sm text-ink-muted">{COPY.profileHint}</p>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="profilePhoto"
            render={({ field, fieldState }) => (
              <DocumentUploadField
                ref={field.ref}
                id="profile-photo"
                label={COPY.profileLabel}
                hint={COPY.fileHint}
                prompt={COPY.profilePrompt}
                icon={UserRound}
                accept={PHOTO_MIME_TYPES}
                fileSchema={photoFileSchema}
                value={asFile(field.value)}
                onChange={(file) => {
                  field.onChange(file);
                  rememberProfilePhoto(user.id, file);
                }}
                error={fieldState.error?.message}
                disabled={uploading}
              />
            )}
          />
        </div>
      </section>

      {sentThisVisit && successKey !== null && (
        <FormAlert
          key={successKey}
          tone="success"
          title={COPY.successTitle}
          message={COPY.success}
        />
      )}

      {!canContinue && (
        <SkipRow
          note={COPY.skipNote}
          href={onboardingStepRoute("insurance")}
          disabled={uploading}
        />
      )}
    </OnboardingStepLayout>
  );
}

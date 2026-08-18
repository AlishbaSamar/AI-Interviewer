"use client";

import { useOnboardingStore } from "./onboarding-store";
import { OnboardingChat } from "./onboarding-chat";
import { OnboardingConfirm } from "./onboarding-confirm";
import { SetupForm } from "./setup-form";
import { createInterviewSession } from "./actions";

const STEP_LABELS = { chat: "1", confirm: "2", picker: "3" } as const;

export function OnboardingWizard() {
  const step = useOnboardingStore((s) => s.step);
  const profileDraft = useOnboardingStore((s) => s.profileDraft);
  const resumeUrl = useOnboardingStore((s) => s.resumeUrl);
  const setStep = useOnboardingStore((s) => s.setStep);

  return (
    <div>
      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-foreground/40">
        Step {STEP_LABELS[step]} of 3
      </p>

      {step === "chat" && <OnboardingChat />}

      {step === "confirm" && profileDraft && <OnboardingConfirm />}

      {step === "picker" && profileDraft && (
        <SetupForm
          action={createInterviewSession}
          profile={profileDraft}
          resumeUrl={resumeUrl}
          onBack={() => setStep("confirm")}
        />
      )}
    </div>
  );
}

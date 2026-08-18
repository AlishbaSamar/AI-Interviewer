"use client";

import { useOnboardingStore, type WizardStep } from "./onboarding-store";
import { OnboardingChat } from "./onboarding-chat";
import { OnboardingConfirm } from "./onboarding-confirm";
import { SetupForm } from "./setup-form";
import { createInterviewSession } from "./actions";

const STEPS: { key: WizardStep; label: string }[] = [
  { key: "chat", label: "Tell us about it" },
  { key: "confirm", label: "Confirm details" },
  { key: "picker", label: "Set up session" },
];

export function OnboardingWizard() {
  const step = useOnboardingStore((s) => s.step);
  const profileDraft = useOnboardingStore((s) => s.profileDraft);
  const resumeUrl = useOnboardingStore((s) => s.resumeUrl);
  const setStep = useOnboardingStore((s) => s.setStep);

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div>
      <div className="mb-6 flex items-center gap-1.5" aria-hidden="true">
        {STEPS.map((s, i) => (
          <div
            key={s.key}
            className={`h-1 flex-1 rounded-full ${i <= stepIndex ? "bg-accent" : "bg-ink-border"}`}
          />
        ))}
      </div>
      <p className="mb-4 font-mono text-xs uppercase tracking-widest text-ink-muted">
        Step {stepIndex + 1} of {STEPS.length} · {STEPS[stepIndex].label}
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

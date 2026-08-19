"use client";

import { useOnboardingStore, type WizardStep } from "./onboarding-store";
import { OnboardingVoice } from "./onboarding-voice";
import { OnboardingConfirm } from "./onboarding-confirm";

const STEPS: { key: WizardStep; label: string }[] = [
  { key: "voice", label: "Talk to our onboarding assistant" },
  { key: "confirm", label: "Review & start" },
];

export function OnboardingWizard() {
  const step = useOnboardingStore((s) => s.step);
  const profileDraft = useOnboardingStore((s) => s.profileDraft);

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

      {step === "voice" && <OnboardingVoice />}

      {step === "confirm" && profileDraft && <OnboardingConfirm />}
    </div>
  );
}

import { create } from "zustand";
import { DIFFICULTIES, INTERVIEW_TYPES, MODES, QUESTION_COUNTS } from "@/lib/interview-options";
import type { OnboardingPersonas } from "@/lib/persona-names";
import type { OnboardingProfile, TranscriptLine } from "@/lib/interview-types";

export type WizardStep = "voice" | "confirm";

type OnboardingState = {
  step: WizardStep;
  personas: OnboardingPersonas | null;
  transcript: TranscriptLine[];
  profileDraft: OnboardingProfile | null;
  resumeUrl: string | null;
  setStep: (step: WizardStep) => void;
  setPersonas: (personas: OnboardingPersonas) => void;
  setTranscript: (transcript: TranscriptLine[]) => void;
  appendTranscriptLine: (line: TranscriptLine) => void;
  setProfileDraft: (draft: OnboardingProfile | null) => void;
  setResumeUrl: (url: string | null) => void;
  skipToConfirm: () => void;
  reset: () => void;
};

const initialState: Pick<
  OnboardingState,
  "step" | "personas" | "transcript" | "profileDraft" | "resumeUrl"
> = {
  step: "voice",
  personas: null,
  transcript: [],
  profileDraft: null,
  resumeUrl: null,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setPersonas: (personas) => set({ personas }),
  setTranscript: (transcript) => set({ transcript }),
  appendTranscriptLine: (line) => set((s) => ({ transcript: [...s.transcript, line] })),
  setProfileDraft: (draft) => set({ profileDraft: draft }),
  setResumeUrl: (url) => set({ resumeUrl: url }),
  skipToConfirm: () =>
    set({
      profileDraft: {
        interviewType: INTERVIEW_TYPES[0],
        domain: null,
        experienceLevel: null,
        techStack: null,
        targetRole: null,
        numQuestions: QUESTION_COUNTS[1],
        difficulty: DIFFICULTIES[1],
        mode: MODES[0].value,
      },
      step: "confirm",
    }),
  reset: () => set(initialState),
}));

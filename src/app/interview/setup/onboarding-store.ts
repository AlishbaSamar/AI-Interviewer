import { create } from "zustand";
import { INTERVIEW_TYPES } from "@/lib/interview-options";
import type { OnboardingChatMessage, ProfileDraft } from "@/lib/onboarding-chat";

export type WizardStep = "chat" | "confirm" | "picker";

type OnboardingState = {
  step: WizardStep;
  messages: OnboardingChatMessage[];
  profileDraft: ProfileDraft | null;
  resumeUrl: string | null;
  setStep: (step: WizardStep) => void;
  pushMessage: (message: OnboardingChatMessage) => void;
  setProfileDraft: (draft: ProfileDraft) => void;
  updateProfileDraft: (draft: ProfileDraft) => void;
  setResumeUrl: (url: string | null) => void;
  skipToConfirm: () => void;
  reset: () => void;
};

const initialState: Pick<OnboardingState, "step" | "messages" | "profileDraft" | "resumeUrl"> = {
  step: "chat",
  messages: [],
  profileDraft: null,
  resumeUrl: null,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  pushMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setProfileDraft: (draft) => set({ profileDraft: draft, step: "confirm" }),
  updateProfileDraft: (draft) => set({ profileDraft: draft }),
  setResumeUrl: (url) => set({ resumeUrl: url }),
  skipToConfirm: () =>
    set({
      profileDraft: {
        interviewType: INTERVIEW_TYPES[0],
        domain: null,
        experienceLevel: null,
        techStack: null,
        targetRole: null,
      },
      step: "confirm",
    }),
  reset: () => set(initialState),
}));

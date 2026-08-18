"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { runOnboardingTurn } from "@/lib/onboarding-chat";
import type { OnboardingChatMessage, ProfileDraft } from "@/lib/onboarding-chat";

export type { OnboardingChatMessage, ProfileDraft };

export type SendOnboardingMessageResult =
  | { success: true; reply: string; profileDraft: ProfileDraft | null }
  | { success: false; error: string };

export async function sendOnboardingMessage(
  history: OnboardingChatMessage[],
  message: string
): Promise<SendOnboardingMessageResult> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { success: false, error: "You must be logged in to continue." };
  }

  if (!message.trim()) {
    return { success: false, error: "Please enter a message." };
  }

  try {
    const { reply, profileDraft } = await runOnboardingTurn(history, message);
    return { success: true, reply, profileDraft };
  } catch (err) {
    console.error("[onboarding-actions] failed to run onboarding turn", err);
    const errorMessage =
      err instanceof Error ? err.message : "Something went wrong. Please try again.";
    return { success: false, error: errorMessage };
  }
}

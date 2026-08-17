"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateInterview, isValidFeedback } from "@/lib/evaluate-interview";
import type { InterviewFeedback, TranscriptLine } from "@/lib/interview-types";

export type { TranscriptLine, InterviewFeedback };

export type SaveTranscriptResult =
  | { success: true }
  | { success: false; error: string };

export type GetFeedbackResult =
  | { success: true; feedback: InterviewFeedback }
  | { success: false; error: string };

export async function saveInterviewTranscript(
  sessionId: string,
  transcript: TranscriptLine[]
): Promise<SaveTranscriptResult> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { success: false, error: "You must be logged in to save a transcript." };
  }

  const interviewSession = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
  });

  if (!interviewSession || interviewSession.userId !== session.user.id) {
    return { success: false, error: "Interview session not found." };
  }

  try {
    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        transcript,
        status: "completed",
        endedAt: new Date(),
      },
    });
    return { success: true };
  } catch (err) {
    console.error("[actions] failed to save interview transcript", err);
    return { success: false, error: "Failed to save the transcript. Please try again." };
  }
}

export async function getInterviewFeedback(sessionId: string): Promise<GetFeedbackResult> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { success: false, error: "You must be logged in to get feedback." };
  }

  const interviewSession = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
  });

  if (!interviewSession || interviewSession.userId !== session.user.id) {
    return { success: false, error: "Interview session not found." };
  }

  if (isValidFeedback(interviewSession.feedback)) {
    return { success: true, feedback: interviewSession.feedback };
  }

  if (!Array.isArray(interviewSession.transcript) || interviewSession.transcript.length === 0) {
    return { success: false, error: "No transcript available to evaluate yet." };
  }

  try {
    const feedback = await evaluateInterview(
      interviewSession.transcript as unknown as TranscriptLine[],
      {
        interviewType: interviewSession.interviewType,
        difficulty: interviewSession.difficulty,
        targetRole: interviewSession.targetRole,
      }
    );

    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { feedback },
    });

    return { success: true, feedback };
  } catch (err) {
    console.error("[actions] failed to generate interview feedback", err);
    const message = err instanceof Error ? err.message : "Failed to generate feedback.";
    return { success: false, error: message };
  }
}

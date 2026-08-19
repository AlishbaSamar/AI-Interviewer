"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createInterviewSession(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  const numQuestions = Number(formData.get("numQuestions"));
  const difficulty = String(formData.get("difficulty"));
  const mode = String(formData.get("mode"));
  const interviewType = String(formData.get("interviewType"));
  const domain = nullableString(formData.get("domain"));
  const experienceLevel = nullableString(formData.get("experienceLevel"));
  const techStack = nullableString(formData.get("techStack"));
  const targetRole = nullableString(formData.get("targetRole"));
  const resumeUrl = nullableString(formData.get("resumeUrl"));
  const interviewerName = nullableString(formData.get("interviewerName"));

  const interviewSession = await prisma.interviewSession.create({
    data: {
      userId: session.user.id,
      interviewType,
      domain,
      experienceLevel,
      techStack,
      targetRole,
      resumeUrl,
      interviewerName,
      numQuestions,
      difficulty,
      mode,
      status: "not_started",
    },
  });

  redirect(`/interview/${interviewSession.id}`);
}

function nullableString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

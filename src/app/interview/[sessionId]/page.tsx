import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InterviewClient } from "./interview-client";

export default async function InterviewSessionPage(
  props: PageProps<"/interview/[sessionId]">
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  const { sessionId } = await props.params;

  const interviewSession = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
  });

  if (!interviewSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-sm text-foreground/60">Interview session not found.</p>
      </div>
    );
  }

  if (interviewSession.userId !== session.user.id) {
    redirect("/dashboard");
  }

  return <InterviewClient session={interviewSession} />;
}

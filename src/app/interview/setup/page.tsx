import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createInterviewSession } from "./actions";
import { SetupForm } from "./setup-form";

export default async function InterviewSetupPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg rounded-xl border border-black/10 bg-background p-8 shadow-sm dark:border-white/10">
        <h1 className="text-2xl font-semibold text-foreground">
          Set up your interview
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          Choose your preferences to get started.
        </p>
        <SetupForm action={createInterviewSession} />
      </div>
    </div>
  );
}

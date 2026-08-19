import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { OnboardingWizard } from "./onboarding-wizard";

export default async function InterviewSetupPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-ink-border bg-ink-surface p-6 sm:p-8">
        <OnboardingWizard userName={session.user.name || session.user.email} />
      </div>
    </div>
  );
}

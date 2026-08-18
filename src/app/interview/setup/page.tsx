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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg rounded-xl border border-black/10 bg-background p-8 shadow-sm dark:border-white/10">
        <OnboardingWizard />
      </div>
    </div>
  );
}

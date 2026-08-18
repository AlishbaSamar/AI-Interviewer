import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-black/10 bg-background p-8 shadow-sm dark:border-white/10">
        <h1 className="text-2xl font-semibold text-foreground">Your profile</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Manage your account details.
        </p>

        <div className="mt-6">
          <span className="block text-sm font-medium text-foreground">Email</span>
          <span className="mt-1 block text-sm text-foreground/60">{user.email}</span>
        </div>

        <div className="mt-4">
          <ProfileForm initialName={user.name ?? ""} />
        </div>

        <Link
          href="/dashboard"
          className="mt-6 block text-center text-sm text-foreground/60 underline"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { AuthCard, AuthHeading, AuthLayout } from "@/components/auth-ui";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeading title="Your profile" subtitle="Manage your account details." />

        <div className="mt-6">
          <span className="block text-sm font-medium text-ink-fg">Email</span>
          <span className="mt-1 block text-sm text-ink-muted">{user.email}</span>
        </div>

        <div className="mt-6">
          <ProfileForm initialName={user.name ?? ""} initialImage={user.image ?? null} />
        </div>

        <Link
          href="/dashboard"
          className="mt-6 block text-center text-sm text-ink-muted transition-colors hover:text-ink-fg"
        >
          Back to dashboard
        </Link>
      </AuthCard>
    </AuthLayout>
  );
}

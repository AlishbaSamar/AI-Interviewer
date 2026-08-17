import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LogoutButton } from "./logout-button";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-black/10 bg-background p-8 text-center shadow-sm dark:border-white/10">
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome, {user.name || user.email}
        </h1>
        <div className="mt-6">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

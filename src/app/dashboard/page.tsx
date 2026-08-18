import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "./logout-button";
import { SessionList } from "./session-list";
import { Analytics } from "./analytics";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  const { user } = session;

  const sessions = await prisma.interviewSession.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-xl border border-black/10 bg-background p-8 text-center shadow-sm dark:border-white/10">
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome, {user.name || user.email}
          </h1>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/profile"
              className="rounded-md border border-black/15 px-3 py-2 text-sm font-medium text-foreground dark:border-white/15"
            >
              Profile
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Your interviews
          </h2>
          <Link
            href="/interview/setup"
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Start New Interview
          </Link>
        </div>

        <div className="mt-4">
          <SessionList sessions={sessions} />
        </div>

        <Analytics sessions={sessions} />
      </div>
    </div>
  );
}

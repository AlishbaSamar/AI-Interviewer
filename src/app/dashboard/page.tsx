import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInitials } from "@/lib/avatar";
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
    <div className="min-h-screen bg-ink px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt=""
                className="h-12 w-12 shrink-0 rounded-full border border-ink-border object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/15 font-display text-sm font-medium text-accent">
                {getInitials(user.name || user.email)}
              </div>
            )}
            <div>
              <h1 className="font-display text-2xl font-medium tracking-tight text-ink-fg sm:text-3xl">
                Welcome back, {user.name || user.email}
              </h1>
              <p className="mt-1 text-sm text-ink-muted">
                Track your practice sessions and keep improving.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="rounded-md border border-ink-border px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink-fg"
            >
              Profile
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg font-medium text-ink-fg">
            Your interviews
          </h2>
          <Link
            href="/interview/setup"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
          >
            <span className="text-base leading-none">+</span>
            Start New Interview
          </Link>
        </div>

        <div className="mt-5">
          <SessionList sessions={sessions} />
        </div>

        <Analytics sessions={sessions} />
      </div>
    </div>
  );
}

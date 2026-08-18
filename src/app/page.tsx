import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-foreground/50">
        AI Interview Practice
      </p>
      <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Practice interviews out loud, with an AI that talks back.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-foreground/60">
        Live voice mock interviews tailored to your role and experience, with
        structured feedback after every session so you can see exactly what
        to improve.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/signup"
          className="rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-black/15 px-6 py-3 text-sm font-medium text-foreground dark:border-white/15"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}

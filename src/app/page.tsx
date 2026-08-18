import Link from "next/link";
import type { ReactNode } from "react";
import { WaveformBars } from "@/components/waveform-bars";

function IconMic() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M6.5 11.5A5.5 5.5 0 0 0 12 17.5a5.5 5.5 0 0 0 5.5-5.5M12 17.5V21"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconBranch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="6" cy="6" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="6" cy="18" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M6 8.2V15.8M8.1 6.9l7.4 4.1M8.1 17.1l7.4-4.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconScore() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M5 19V11M12 19V5M19 19v-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M3.5 19.5h17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconTrend() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4 16.5 9.5 11l3.5 3.5L20 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 7H20v5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const features: { icon: ReactNode; title: string; body: string }[] = [
  {
    icon: <IconMic />,
    title: "Voice-based practice",
    body: "You talk, it listens. Answers happen on a live call instead of a text box, so you build the same delivery muscle you'll need in the real room.",
  },
  {
    icon: <IconBranch />,
    title: "Adaptive follow-up questions",
    body: "The interviewer reacts to what you actually said, pushing on vague claims and thin details the way a real interviewer would.",
  },
  {
    icon: <IconScore />,
    title: "Structured feedback scoring",
    body: "Every session ends with a rubric-based breakdown across communication, structure, and technical depth, not a generic pass or fail.",
  },
  {
    icon: <IconTrend />,
    title: "Progress tracking",
    body: "Scores are logged per session so you can see which parts of your answers are actually getting sharper before the real interview.",
  },
];

const steps = [
  {
    n: "01",
    title: "Setup",
    body: "Pick the role, seniority, and focus areas — behavioral, system design, or role-specific technical rounds.",
  },
  {
    n: "02",
    title: "Live voice interview",
    body: "Join a real-time voice call with the AI interviewer. Speak your answers; it asks follow-ups based on what it hears.",
  },
  {
    n: "03",
    title: "Get feedback",
    body: "When the call ends, get a transcript and a scored breakdown of how you communicated and structured each answer.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-ink text-ink-fg">
      <header className="sticky top-0 z-30 border-b border-ink-border/70 bg-ink/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-end justify-center gap-[2px] rounded-md bg-ink-surface p-1.5">
              <span className="h-2 w-[2.5px] rounded-full bg-accent" />
              <span className="h-3.5 w-[2.5px] rounded-full bg-accent" />
              <span className="h-1.5 w-[2.5px] rounded-full bg-accent-violet" />
            </span>
            <span className="font-display text-sm font-medium tracking-tight text-ink-fg">
              AI Interview
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-ink-muted sm:flex">
            <a href="#how-it-works" className="transition-colors hover:text-ink-fg">
              How it works
            </a>
            <a href="#features" className="transition-colors hover:text-ink-fg">
              Features
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-ink-muted transition-colors hover:text-ink-fg sm:block"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-ink"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <WaveformBars
            count={56}
            seed={3}
            minHeight={10}
            className="pointer-events-none absolute inset-x-0 bottom-0 flex h-56 items-end justify-center gap-[6px] px-4 opacity-[0.12] [mask-image:linear-gradient(to_top,black,transparent)] sm:h-72"
            barClassName="w-[3px] flex-1 max-w-[6px] rounded-full bg-gradient-to-t from-accent to-accent-violet"
          />

          <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-ink-border bg-ink-surface px-3 py-1 font-mono text-xs uppercase tracking-widest text-accent">
                Voice-based mock interviews
              </span>

              <h1 className="mt-6 font-display text-4xl font-medium leading-[1.1] tracking-tight text-ink-fg sm:text-5xl lg:text-6xl">
                Practice interviews out loud, with an AI that talks back.
              </h1>

              <p className="mt-6 max-w-xl text-lg text-ink-muted">
                Join a live voice call with an AI interviewer that asks real
                questions, follows up on what you actually say, and scores
                your answers when the call ends. No scripts, no typing.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="rounded-md bg-accent px-6 py-3 text-center text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
                >
                  Get started
                </Link>
                <Link
                  href="/login"
                  className="rounded-md border border-ink-border px-6 py-3 text-center text-sm font-medium text-ink-fg transition-colors hover:border-ink-fg/40"
                >
                  Log in
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-wide text-ink-muted">
                <span>Live voice, not text</span>
                <span className="text-ink-border">/</span>
                <span>Adaptive questions</span>
                <span className="text-ink-border">/</span>
                <span>Instant scoring</span>
              </div>
            </div>

            {/* Live call mockup */}
            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-accent/10 via-transparent to-accent-violet/10 blur-2xl" />
              <div className="rounded-2xl border border-ink-border bg-ink-surface p-5 shadow-2xl shadow-black/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="h-2 w-2 rounded-full bg-accent motion-safe:animate-[soft-pulse_1.6s_ease-in-out_infinite]" />
                    </span>
                    <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">
                      Live interview
                    </span>
                  </div>
                  <span className="font-mono text-xs text-ink-muted">
                    04:12
                  </span>
                </div>

                <WaveformBars
                  count={28}
                  seed={11}
                  minHeight={15}
                  className="mt-6 flex h-24 items-end justify-between gap-[3px]"
                  barClassName="flex-1 rounded-full bg-gradient-to-t from-accent to-accent-violet"
                />

                <div className="mt-6 flex items-center justify-between border-t border-ink-border pt-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-surface-2 text-accent-violet">
                      <IconMic />
                    </span>
                    <div className="leading-tight">
                      <p className="text-xs font-medium text-ink-fg">
                        AI Interviewer
                      </p>
                      <p className="font-mono text-[10px] text-ink-muted">
                        speaking
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <div className="leading-tight">
                      <p className="text-xs font-medium text-ink-fg">You</p>
                      <p className="font-mono text-[10px] text-ink-muted">
                        listening
                      </p>
                    </div>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-surface-2 text-ink-muted">
                      <IconMic />
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {["Frontend Engineer", "Mid-level", "Behavioral"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-ink-border px-2.5 py-1 font-mono text-[10px] text-ink-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="border-t border-ink-border px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">
              How it works
            </p>
            <h2 className="mt-3 max-w-lg font-display text-3xl font-medium tracking-tight text-ink-fg sm:text-4xl">
              Three steps, one real conversation.
            </h2>

            <div className="relative mt-16 grid gap-12 sm:grid-cols-3 sm:gap-8">
              <div
                aria-hidden="true"
                className="absolute top-6 right-0 left-0 hidden h-px bg-ink-border sm:block"
              />
              {steps.map((step) => (
                <div key={step.n} className="relative">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-ink-border bg-ink font-mono text-sm text-accent">
                    {step.n}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-ink-fg">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="border-t border-ink-border px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <p className="font-mono text-xs uppercase tracking-widest text-accent-violet">
              What you get
            </p>
            <h2 className="mt-3 max-w-lg font-display text-3xl font-medium tracking-tight text-ink-fg sm:text-4xl">
              Built around talking, not typing.
            </h2>

            <div className="mt-14 grid gap-5 sm:grid-cols-2">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl border border-ink-border bg-ink-surface p-6 transition-colors hover:border-accent/40"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-surface-2 text-accent">
                    {f.icon}
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-ink-fg">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {f.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CLOSING CTA */}
        <section className="border-t border-ink-border px-6 py-20">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-2xl border border-ink-border bg-ink-surface px-8 py-10 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-2xl font-medium tracking-tight text-ink-fg">
                Your next interview shouldn&apos;t be the first time you say it out loud.
              </h2>
              <p className="mt-2 text-sm text-ink-muted">
                Start a voice session in under a minute.
              </p>
            </div>
            <Link
              href="/signup"
              className="shrink-0 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-ink"
            >
              Get started
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink-border px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-end justify-center gap-[2px] rounded-md bg-ink-surface p-1">
                <span className="h-1.5 w-[2px] rounded-full bg-accent" />
                <span className="h-2.5 w-[2px] rounded-full bg-accent" />
                <span className="h-1 w-[2px] rounded-full bg-accent-violet" />
              </span>
              <span className="font-display text-sm font-medium text-ink-fg">
                AI Interview
              </span>
            </div>
            <p className="mt-3 text-sm text-ink-muted">
              Voice-based mock interviews with adaptive questions and
              structured feedback.
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
                Product
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a href="#how-it-works" className="text-ink-muted hover:text-ink-fg">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-ink-muted hover:text-ink-fg">
                    Features
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
                Account
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link href="/login" className="text-ink-muted hover:text-ink-fg">
                    Log in
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-ink-muted hover:text-ink-fg">
                    Sign up
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-6xl border-t border-ink-border pt-6 font-mono text-xs text-ink-muted">
          © {new Date().getFullYear()} AI Interview Practice.
        </div>
      </footer>
    </div>
  );
}

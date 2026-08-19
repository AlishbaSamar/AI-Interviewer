"use client";

import { useState } from "react";
import Link from "next/link";
import type { InterviewSession } from "@/generated/prisma/client";
import { isValidFeedback } from "@/lib/evaluate-interview";
import { WaveformBars } from "@/components/waveform-bars";
import { retakeInterviewSession } from "@/app/interview/[sessionId]/actions";
import { SessionCompare } from "./session-compare";

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function statusDotClass(status: string): string {
  switch (status) {
    case "completed":
      return "bg-accent";
    case "in_progress":
      return "bg-accent-violet motion-safe:animate-[soft-pulse_1.6s_ease-in-out_infinite]";
    default:
      return "bg-ink-muted";
  }
}

function scoreTierClass(score: number): string {
  if (score >= 75) return "border-accent/50 text-accent";
  if (score >= 50) return "border-accent-violet/50 text-accent-violet";
  return "border-ink-border text-ink-muted";
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border font-mono text-sm font-semibold ${scoreTierClass(score)}`}
      title={`Score: ${score}/100`}
    >
      {score}
    </div>
  );
}

function Pill({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-ink-border px-2.5 py-1 text-xs text-ink-muted">
      {children}
    </span>
  );
}

export function SessionList({ sessions }: { sessions: InterviewSession[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  if (sessions.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-ink-border bg-ink-surface px-6 py-16 text-center">
        <WaveformBars
          count={40}
          seed={5}
          minHeight={10}
          className="pointer-events-none absolute inset-x-0 bottom-0 flex h-28 items-end justify-center gap-[6px] px-4 opacity-[0.08] [mask-image:linear-gradient(to_top,black,transparent)]"
          barClassName="w-[3px] flex-1 max-w-[6px] rounded-full bg-gradient-to-t from-accent to-accent-violet"
        />
        <div className="relative">
          <p className="font-display text-lg font-medium text-ink-fg">
            No interviews yet
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Start a live voice session to get your first score.
          </p>
          <Link
            href="/interview/setup"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
          >
            Start your first interview
          </Link>
        </div>
      </div>
    );
  }

  const selectedSessions = sessions.filter((s) => selectedIds.includes(s.id));

  return (
    <div>
      {selectedSessions.length === 2 && (
        <SessionCompare sessions={selectedSessions} onClose={() => setSelectedIds([])} />
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => {
          const feedback = isValidFeedback(session.feedback) ? session.feedback : null;
          const isSelected = selectedIds.includes(session.id);

          return (
            <div
              key={session.id}
              className={`group relative rounded-xl border bg-ink-surface p-5 transition-[transform,border-color] duration-200 motion-reduce:transition-none hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 ${
                isSelected ? "border-accent/60" : "border-ink-border hover:border-accent/40"
              }`}
            >
              <Link
                href={`/interview/${session.id}`}
                className="absolute inset-0 z-10 rounded-xl"
                aria-label={`Open ${session.interviewType} interview from ${formatDate(session.createdAt)}`}
              />

              <div className="relative flex items-start justify-between gap-3">
                <h3 className="font-display text-base font-medium leading-snug text-ink-fg">
                  {session.interviewType}
                </h3>
                {feedback && <ScoreBadge score={feedback.overallScore} />}
              </div>

              <div className="relative mt-3 flex flex-wrap gap-1.5">
                {session.domain && <Pill>{session.domain}</Pill>}
                <Pill>{session.difficulty}</Pill>
                <Pill>{session.mode}</Pill>
              </div>

              <div className="relative mt-5 flex items-center justify-between border-t border-ink-border pt-3">
                <span className="flex items-center gap-2 text-xs text-ink-muted">
                  <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(session.status)}`} />
                  {formatStatus(session.status)}
                </span>
                <span className="font-mono text-xs text-ink-muted">
                  {formatDate(session.createdAt)}
                </span>
              </div>

              {feedback && (
                <div className="relative z-20 mt-3 flex items-center justify-between border-t border-ink-border pt-3">
                  <button
                    type="button"
                    onClick={() => toggleSelect(session.id)}
                    aria-pressed={isSelected}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                      isSelected
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-ink-border text-ink-muted hover:text-ink-fg"
                    }`}
                  >
                    {isSelected ? "Selected" : "Compare"}
                  </button>
                  <div className="flex items-center gap-3">
                    <form action={retakeInterviewSession.bind(null, session.id)}>
                      <button
                        type="submit"
                        className="text-xs font-medium text-ink-muted hover:text-ink-fg"
                      >
                        Retake
                      </button>
                    </form>
                    <a
                      href={`/interview/${session.id}/report`}
                      download={`interview-report-${session.id}.pdf`}
                      className="text-xs font-medium text-ink-muted hover:text-ink-fg"
                    >
                      Report
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

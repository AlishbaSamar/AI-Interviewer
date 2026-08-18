"use client";

import { useState } from "react";
import Link from "next/link";
import type { InterviewSession } from "@/generated/prisma/client";
import { isValidFeedback } from "@/lib/evaluate-interview";
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

function statusBadgeClass(status: string): string {
  switch (status) {
    case "completed":
      return "bg-green-500/10 text-green-600 dark:text-green-400";
    case "in_progress":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    default:
      return "bg-black/5 text-foreground/60 dark:bg-white/10";
  }
}

function scoreBadgeClass(score: number): string {
  if (score >= 70) return "bg-green-500/10 text-green-600 dark:text-green-400";
  if (score >= 40) return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
  return "bg-red-500/10 text-red-600 dark:text-red-400";
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
      <div className="rounded-xl border border-black/10 bg-background p-10 text-center dark:border-white/10">
        <p className="text-sm text-foreground/60">
          You haven&apos;t taken any interviews yet.
        </p>
        <Link
          href="/interview/setup"
          className="mt-4 inline-block rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Start your first interview
        </Link>
      </div>
    );
  }

  const selectedSessions = sessions.filter((s) => selectedIds.includes(s.id));

  return (
    <div>
      {selectedSessions.length === 2 && (
        <SessionCompare sessions={selectedSessions} onClose={() => setSelectedIds([])} />
      )}

      <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-xs uppercase text-foreground/50 dark:border-white/10">
              <th className="w-8 px-4 py-3 font-medium"></th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Domain</th>
              <th className="px-4 py-3 font-medium">Difficulty</th>
              <th className="px-4 py-3 font-medium">Mode</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => {
              const feedback = isValidFeedback(session.feedback) ? session.feedback : null;

              return (
                <tr
                  key={session.id}
                  className="border-b border-black/5 last:border-b-0 dark:border-white/5"
                >
                  <td className="px-4 py-3">
                    {feedback && (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(session.id)}
                        onChange={() => toggleSelect(session.id)}
                        aria-label={`Select ${session.interviewType} interview from ${formatDate(session.createdAt)} for comparison`}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {session.interviewType}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    {session.domain || "—"}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">{session.difficulty}</td>
                  <td className="px-4 py-3 text-foreground/70">{session.mode}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(
                        session.status
                      )}`}
                    >
                      {formatStatus(session.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {feedback ? (
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${scoreBadgeClass(
                          feedback.overallScore
                        )}`}
                      >
                        {feedback.overallScore}
                      </span>
                    ) : (
                      <span className="text-foreground/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    {formatDate(session.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {feedback && (
                        <a
                          href={`/interview/${session.id}/report`}
                          download={`interview-report-${session.id}.pdf`}
                          className="rounded-md border border-black/15 px-3 py-1.5 text-xs font-medium text-foreground dark:border-white/15"
                        >
                          Report
                        </a>
                      )}
                      <Link
                        href={`/interview/${session.id}`}
                        className="rounded-md border border-black/15 px-3 py-1.5 text-xs font-medium text-foreground dark:border-white/15"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

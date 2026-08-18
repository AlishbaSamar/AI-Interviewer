"use client";

import type { InterviewSession } from "@/generated/prisma/client";
import { isValidFeedback } from "@/lib/evaluate-interview";
import { PARAMETER_LABELS } from "@/lib/interview-types";
import { formatDate } from "./session-list";

export function SessionCompare({
  sessions,
  onClose,
}: {
  sessions: InterviewSession[];
  onClose: () => void;
}) {
  const [a, b] = sessions;
  const feedbackA = isValidFeedback(a.feedback) ? a.feedback : null;
  const feedbackB = isValidFeedback(b.feedback) ? b.feedback : null;

  if (!feedbackA || !feedbackB) return null;

  return (
    <div className="mb-4 rounded-xl border border-accent/40 bg-ink-surface p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-medium text-ink-fg">Comparison</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-medium text-ink-muted hover:text-ink-fg"
        >
          Clear
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {[a, b].map((session, i) => {
          const feedback = i === 0 ? feedbackA : feedbackB;
          return (
            <div key={session.id}>
              <p className="text-sm font-medium text-ink-fg">{session.interviewType}</p>
              <p className="font-mono text-xs text-ink-muted">{formatDate(session.createdAt)}</p>
              <p className="mt-1 text-2xl font-semibold text-accent">
                {feedback.overallScore}
                <span className="text-xs font-normal text-ink-muted"> / 100</span>
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        {PARAMETER_LABELS.map(({ key, label }) => (
          <div key={key} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-xs">
            <span className="text-ink-muted">{label}</span>
            <span className="w-10 text-right font-mono font-medium text-ink-fg">
              {feedbackA.parameters[key]}
            </span>
            <span className="w-10 text-right font-mono font-medium text-ink-fg">
              {feedbackB.parameters[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

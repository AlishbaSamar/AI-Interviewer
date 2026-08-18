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
    <div className="mb-4 rounded-xl border border-black/10 bg-background p-5 dark:border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Comparison</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-medium text-foreground/60 underline"
        >
          Clear
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {[a, b].map((session, i) => {
          const feedback = i === 0 ? feedbackA : feedbackB;
          return (
            <div key={session.id}>
              <p className="text-sm font-medium text-foreground">{session.interviewType}</p>
              <p className="text-xs text-foreground/50">{formatDate(session.createdAt)}</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {feedback.overallScore}
                <span className="text-xs font-normal text-foreground/50"> / 100</span>
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        {PARAMETER_LABELS.map(({ key, label }) => (
          <div key={key} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-xs">
            <span className="text-foreground/70">{label}</span>
            <span className="w-10 text-right font-medium text-foreground">
              {feedbackA.parameters[key]}
            </span>
            <span className="w-10 text-right font-medium text-foreground">
              {feedbackB.parameters[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

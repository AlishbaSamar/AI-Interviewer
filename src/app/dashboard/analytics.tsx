import type { InterviewSession } from "@/generated/prisma/client";
import { isValidFeedback } from "@/lib/evaluate-interview";
import { PARAMETER_LABELS, type InterviewFeedback } from "@/lib/interview-types";

type ScoredSession = InterviewSession & { feedback: InterviewFeedback };

function hasFeedback(session: InterviewSession): session is ScoredSession {
  return isValidFeedback(session.feedback);
}

export function Analytics({ sessions }: { sessions: InterviewSession[] }) {
  const scored = sessions.filter(hasFeedback).sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  if (scored.length === 0) return null;

  const scores = scored.map((s) => s.feedback.overallScore);

  const averages = PARAMETER_LABELS.map(({ key, label }) => ({
    key,
    label,
    avg: Math.round(
      scored.reduce((sum, s) => sum + s.feedback.parameters[key], 0) / scored.length
    ),
  }));

  const lowest = averages.reduce((min, cur) => (cur.avg < min.avg ? cur : min), averages[0]);

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-ink-border bg-ink-surface p-5">
        <h3 className="font-display text-sm font-medium text-ink-fg">
          Score trend
        </h3>
        <Sparkline scores={scores} />
      </div>

      <div className="rounded-xl border border-ink-border bg-ink-surface p-5">
        <h3 className="font-display text-sm font-medium text-ink-fg">
          Skill-wise average
        </h3>
        <div className="mt-3 space-y-2.5">
          {averages.map(({ key, label, avg }) => (
            <div key={key}>
              <div className="flex justify-between text-xs text-ink-muted">
                <span>{label}</span>
                <span className="font-mono">{avg}/100</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-ink-surface-2">
                <div
                  className="h-1.5 rounded-full bg-accent"
                  style={{ width: `${avg}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-ink-border bg-ink-surface p-5 sm:col-span-2">
        <h3 className="font-display text-sm font-medium text-ink-fg">
          Recommended focus
        </h3>
        <p className="mt-1 text-sm text-ink-muted">
          Your lowest-scoring area is{" "}
          <span className="font-medium text-accent-violet">{lowest.label}</span> (average{" "}
          {lowest.avg}/100). Consider practicing another interview with this in mind.
        </p>
      </div>
    </div>
  );
}

function Sparkline({ scores }: { scores: number[] }) {
  if (scores.length < 2) {
    return (
      <p className="mt-3 text-sm text-ink-muted">
        Complete another scored interview to see your trend.
      </p>
    );
  }

  const width = 240;
  const height = 60;
  const max = Math.max(...scores, 100);
  const min = Math.min(...scores, 0);
  const range = max - min || 1;

  const points = scores
    .map((score, i) => {
      const x = (i / (scores.length - 1)) * width;
      const y = height - ((score - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="mt-3 h-16 w-full text-accent"
    >
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

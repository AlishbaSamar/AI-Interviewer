"use client";

import { useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { QUESTION_COUNTS, DIFFICULTIES, MODES, INTERVIEW_TYPES } from "@/lib/interview-options";
import type { ProfileDraft } from "@/lib/onboarding-chat";

function OptionPill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-h-11 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-surface ${
        selected
          ? "border-accent bg-accent text-ink"
          : "border-ink-border bg-ink-surface-2 text-ink-muted hover:border-ink-fg/30 hover:text-ink-fg"
      }`}
    >
      {children}
    </button>
  );
}

function OptionGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="font-mono text-xs uppercase tracking-widest text-ink-muted">
        {label}
      </legend>
      <div className="mt-2.5 flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-surface disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
    >
      {pending && (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 rounded-full border-2 border-ink/30 border-t-ink motion-safe:animate-spin"
        />
      )}
      {pending ? "Starting interview..." : "Start Interview"}
    </button>
  );
}

export function SetupForm({
  action,
  profile,
  resumeUrl,
  onBack,
}: {
  action: (formData: FormData) => void;
  profile: ProfileDraft;
  resumeUrl: string | null;
  onBack: () => void;
}) {
  const [interviewType, setInterviewType] = useState<string>(profile.interviewType);
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<string>("Medium");
  const [mode, setMode] = useState<string>("Practice");

  const canSubmit = Boolean(interviewType && numQuestions && difficulty && mode);

  return (
    <form action={action} className="mt-6 space-y-6">
      <input type="hidden" name="numQuestions" value={numQuestions} />
      <input type="hidden" name="difficulty" value={difficulty} />
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="interviewType" value={interviewType} />
      <input type="hidden" name="domain" value={profile.domain ?? ""} />
      <input type="hidden" name="experienceLevel" value={profile.experienceLevel ?? ""} />
      <input type="hidden" name="techStack" value={profile.techStack ?? ""} />
      <input type="hidden" name="targetRole" value={profile.targetRole ?? ""} />
      <input type="hidden" name="resumeUrl" value={resumeUrl ?? ""} />

      <div className="flex items-start justify-between gap-3 rounded-lg border border-ink-border bg-ink-surface-2 px-3.5 py-3 text-sm">
        <div>
          <p className="font-medium text-ink-fg">{profile.interviewType} interview</p>
          <p className="mt-0.5 text-ink-muted">
            {[profile.targetRole, profile.domain, profile.experienceLevel]
              .filter(Boolean)
              .join(" · ") || "No additional details"}
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 rounded text-xs font-medium text-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          Edit
        </button>
      </div>

      <OptionGroup label="Interview type">
        {INTERVIEW_TYPES.map((type) => (
          <OptionPill
            key={type}
            selected={interviewType === type}
            onClick={() => setInterviewType(type)}
          >
            {type}
          </OptionPill>
        ))}
      </OptionGroup>

      <OptionGroup label="Number of questions">
        {QUESTION_COUNTS.map((count) => (
          <OptionPill
            key={count}
            selected={numQuestions === count}
            onClick={() => setNumQuestions(count)}
          >
            {count}
          </OptionPill>
        ))}
      </OptionGroup>

      <OptionGroup label="Difficulty">
        {DIFFICULTIES.map((level) => (
          <OptionPill
            key={level}
            selected={difficulty === level}
            onClick={() => setDifficulty(level)}
          >
            {level}
          </OptionPill>
        ))}
      </OptionGroup>

      <OptionGroup label="Mode">
        {MODES.map((m) => (
          <OptionPill key={m.value} selected={mode === m.value} onClick={() => setMode(m.value)}>
            {m.label}
          </OptionPill>
        ))}
      </OptionGroup>

      <SubmitButton disabled={!canSubmit} />
    </form>
  );
}

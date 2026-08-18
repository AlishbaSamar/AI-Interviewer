"use client";

import { useState } from "react";
import { QUESTION_COUNTS, DIFFICULTIES, MODES } from "@/lib/interview-options";
import type { ProfileDraft } from "@/lib/onboarding-chat";

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
        selected
          ? "border-foreground bg-foreground text-background"
          : "border-black/15 text-foreground hover:border-foreground/40 dark:border-white/15"
      }`}
    >
      {children}
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
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<string>("Medium");
  const [mode, setMode] = useState<string>("Practice");

  return (
    <form action={action} className="mt-6 space-y-6">
      <input type="hidden" name="numQuestions" value={numQuestions} />
      <input type="hidden" name="difficulty" value={difficulty} />
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="interviewType" value={profile.interviewType} />
      <input type="hidden" name="domain" value={profile.domain ?? ""} />
      <input type="hidden" name="experienceLevel" value={profile.experienceLevel ?? ""} />
      <input type="hidden" name="techStack" value={profile.techStack ?? ""} />
      <input type="hidden" name="targetRole" value={profile.targetRole ?? ""} />
      <input type="hidden" name="resumeUrl" value={resumeUrl ?? ""} />

      <div className="flex items-start justify-between rounded-md border border-black/10 bg-black/[0.02] px-3 py-2 text-sm dark:border-white/10 dark:bg-white/[0.02]">
        <div>
          <p className="font-medium text-foreground">{profile.interviewType} interview</p>
          <p className="mt-0.5 text-foreground/60">
            {[profile.targetRole, profile.domain, profile.experienceLevel]
              .filter(Boolean)
              .join(" · ") || "No additional details"}
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 text-xs font-medium text-foreground/60 underline"
        >
          Edit
        </button>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-foreground">
          Number of questions
        </legend>
        <div className="mt-2 flex gap-2">
          {QUESTION_COUNTS.map((count) => (
            <OptionButton
              key={count}
              selected={numQuestions === count}
              onClick={() => setNumQuestions(count)}
            >
              {count}
            </OptionButton>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-foreground">Difficulty</legend>
        <div className="mt-2 flex gap-2">
          {DIFFICULTIES.map((level) => (
            <OptionButton
              key={level}
              selected={difficulty === level}
              onClick={() => setDifficulty(level)}
            >
              {level}
            </OptionButton>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-foreground">Mode</legend>
        <div className="mt-2 flex gap-2">
          {MODES.map((m) => (
            <OptionButton
              key={m.value}
              selected={mode === m.value}
              onClick={() => setMode(m.value)}
            >
              {m.label}
            </OptionButton>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background"
      >
        Start Interview
      </button>
    </form>
  );
}

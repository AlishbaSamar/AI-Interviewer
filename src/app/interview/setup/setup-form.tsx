"use client";

import { useState } from "react";

const QUESTION_COUNTS = [5, 10, 15] as const;
const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
const MODES = [
  { value: "Practice", label: "Practice Mode" },
  { value: "Full Mock", label: "Full Mock Interview Mode" },
] as const;
const INTERVIEW_TYPES = ["Behavioral", "Coding", "System Design", "HR"] as const;

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
}: {
  action: (formData: FormData) => void;
}) {
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<string>("Medium");
  const [mode, setMode] = useState<string>("Practice");
  const [interviewType, setInterviewType] = useState<string>("Behavioral");

  return (
    <form action={action} className="mt-6 space-y-6">
      <input type="hidden" name="numQuestions" value={numQuestions} />
      <input type="hidden" name="difficulty" value={difficulty} />
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="interviewType" value={interviewType} />

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

      <fieldset>
        <legend className="text-sm font-medium text-foreground">
          Interview type
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {INTERVIEW_TYPES.map((type) => (
            <OptionButton
              key={type}
              selected={interviewType === type}
              onClick={() => setInterviewType(type)}
            >
              {type}
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

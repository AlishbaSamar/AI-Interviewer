"use client";

import { useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { DIFFICULTIES, INTERVIEW_TYPES, MODES, QUESTION_COUNTS } from "@/lib/interview-options";
import { useOnboardingStore } from "./onboarding-store";
import { uploadResumeAction } from "./resume-actions";
import { createInterviewSession } from "./actions";

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

export function OnboardingConfirm() {
  const profileDraft = useOnboardingStore((s) => s.profileDraft);
  const personas = useOnboardingStore((s) => s.personas);
  const resumeUrl = useOnboardingStore((s) => s.resumeUrl);
  const setProfileDraft = useOnboardingStore((s) => s.setProfileDraft);
  const setResumeUrl = useOnboardingStore((s) => s.setResumeUrl);
  const setStep = useOnboardingStore((s) => s.setStep);
  const reset = useOnboardingStore((s) => s.reset);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [fileName, setFileName] = useState("");

  if (!profileDraft) return null;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");
    setFileName(file.name);

    const formData = new FormData();
    formData.set("resume", file);

    const result = await uploadResumeAction(formData);
    setUploading(false);

    if (!result.success) {
      setUploadError(result.error);
      setResumeUrl(null);
      return;
    }

    setResumeUrl(result.url);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-medium tracking-tight text-ink-fg">
        Review your details
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        {personas
          ? `Here's what ${personas.agentName} gathered - make sure it looks right before we start.`
          : "Make sure this looks right before continuing."}
      </p>

      <form action={createInterviewSession} className="mt-6 space-y-6">
        <input type="hidden" name="interviewType" value={profileDraft.interviewType} />
        <input type="hidden" name="domain" value={profileDraft.domain ?? ""} />
        <input type="hidden" name="experienceLevel" value={profileDraft.experienceLevel ?? ""} />
        <input type="hidden" name="techStack" value={profileDraft.techStack ?? ""} />
        <input type="hidden" name="targetRole" value={profileDraft.targetRole ?? ""} />
        <input type="hidden" name="numQuestions" value={profileDraft.numQuestions} />
        <input type="hidden" name="difficulty" value={profileDraft.difficulty} />
        <input type="hidden" name="mode" value={profileDraft.mode} />
        <input type="hidden" name="resumeUrl" value={resumeUrl ?? ""} />
        <input type="hidden" name="interviewerName" value={personas?.interviewerName ?? ""} />

        <OptionGroup label="Interview type">
          {INTERVIEW_TYPES.map((type) => (
            <OptionPill
              key={type}
              selected={profileDraft.interviewType === type}
              onClick={() => setProfileDraft({ ...profileDraft, interviewType: type })}
            >
              {type}
            </OptionPill>
          ))}
        </OptionGroup>

        {(
          [
            ["domain", "Domain / area"],
            ["experienceLevel", "Experience level"],
            ["techStack", "Tech stack"],
            ["targetRole", "Target role"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-ink-fg">{label}</label>
            <input
              type="text"
              value={profileDraft[key] ?? ""}
              onChange={(e) =>
                setProfileDraft({
                  ...profileDraft,
                  [key]: e.target.value || null,
                })
              }
              placeholder="Optional"
              className="mt-1.5 w-full rounded-md border border-ink-border bg-ink-surface-2 px-3 py-2.5 text-sm text-ink-fg outline-none transition-colors placeholder:text-ink-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/25"
            />
          </div>
        ))}

        <OptionGroup label="Number of questions">
          {QUESTION_COUNTS.map((count) => (
            <OptionPill
              key={count}
              selected={profileDraft.numQuestions === count}
              onClick={() => setProfileDraft({ ...profileDraft, numQuestions: count })}
            >
              {count}
            </OptionPill>
          ))}
        </OptionGroup>

        <OptionGroup label="Difficulty">
          {DIFFICULTIES.map((level) => (
            <OptionPill
              key={level}
              selected={profileDraft.difficulty === level}
              onClick={() => setProfileDraft({ ...profileDraft, difficulty: level })}
            >
              {level}
            </OptionPill>
          ))}
        </OptionGroup>

        <OptionGroup label="Mode">
          {MODES.map((m) => (
            <OptionPill
              key={m.value}
              selected={profileDraft.mode === m.value}
              onClick={() => setProfileDraft({ ...profileDraft, mode: m.value })}
            >
              {m.label}
            </OptionPill>
          ))}
        </OptionGroup>

        <div>
          <label className="block text-sm font-medium text-ink-fg">Resume (optional)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            disabled={uploading}
            className="mt-1.5 w-full text-sm text-ink-muted file:mr-3 file:rounded-md file:border file:border-ink-border file:bg-ink-surface-2 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink-fg disabled:opacity-50"
          />
          {uploading && (
            <p className="mt-1.5 text-xs text-ink-muted">Uploading {fileName}...</p>
          )}
          {uploadError && (
            <p role="alert" className="mt-1.5 text-xs text-red-400">
              {uploadError}
            </p>
          )}
          {resumeUrl && !uploading && (
            <p className="mt-1.5 text-xs text-accent">Resume uploaded.</p>
          )}
        </div>

        <SubmitButton disabled={uploading} />

        <button
          type="button"
          onClick={() => {
            reset();
            setStep("voice");
          }}
          className="block w-full text-center text-xs font-medium text-ink-muted underline-offset-2 hover:underline"
        >
          Start over with the voice assistant
        </button>
      </form>
    </div>
  );
}

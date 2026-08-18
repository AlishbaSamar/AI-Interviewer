"use client";

import { useState } from "react";
import { useOnboardingStore } from "./onboarding-store";
import { uploadResumeAction } from "./resume-actions";
import { INTERVIEW_TYPES } from "@/lib/interview-options";

export function OnboardingConfirm() {
  const profileDraft = useOnboardingStore((s) => s.profileDraft);
  const resumeUrl = useOnboardingStore((s) => s.resumeUrl);
  const updateProfileDraft = useOnboardingStore((s) => s.updateProfileDraft);
  const setResumeUrl = useOnboardingStore((s) => s.setResumeUrl);
  const setStep = useOnboardingStore((s) => s.setStep);

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
        Make sure this looks right before continuing.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-fg">
            Interview type
          </label>
          <select
            value={profileDraft.interviewType}
            onChange={(e) =>
              updateProfileDraft({ ...profileDraft, interviewType: e.target.value })
            }
            className="mt-1.5 w-full rounded-md border border-ink-border bg-ink-surface-2 px-3 py-2.5 text-sm text-ink-fg outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25"
          >
            {INTERVIEW_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

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
                updateProfileDraft({
                  ...profileDraft,
                  [key]: e.target.value || null,
                })
              }
              placeholder="Optional"
              className="mt-1.5 w-full rounded-md border border-ink-border bg-ink-surface-2 px-3 py-2.5 text-sm text-ink-fg outline-none transition-colors placeholder:text-ink-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/25"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-ink-fg">
            Resume (optional)
          </label>
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
      </div>

      <button
        type="button"
        onClick={() => setStep("picker")}
        className="mt-6 w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        Continue
      </button>
    </div>
  );
}

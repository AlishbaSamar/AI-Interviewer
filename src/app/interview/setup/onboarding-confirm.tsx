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
      <h1 className="text-2xl font-semibold text-foreground">
        Review your details
      </h1>
      <p className="mt-1 text-sm text-foreground/60">
        Make sure this looks right before continuing.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground">
            Interview type
          </label>
          <select
            value={profileDraft.interviewType}
            onChange={(e) =>
              updateProfileDraft({ ...profileDraft, interviewType: e.target.value })
            }
            className="mt-1 w-full rounded-md border border-black/15 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40 dark:border-white/15"
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
            <label className="block text-sm font-medium text-foreground">
              {label}
            </label>
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
              className="mt-1 w-full rounded-md border border-black/15 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40 dark:border-white/15"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-foreground">
            Resume (optional)
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            disabled={uploading}
            className="mt-1 w-full text-sm text-foreground/70 file:mr-3 file:rounded-md file:border file:border-black/15 file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground dark:file:border-white/15"
          />
          {uploading && (
            <p className="mt-1 text-xs text-foreground/50">Uploading {fileName}...</p>
          )}
          {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
          {resumeUrl && !uploading && (
            <p className="mt-1 text-xs text-green-600">Resume uploaded.</p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setStep("picker")}
        className="mt-6 w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background"
      >
        Continue
      </button>
    </div>
  );
}

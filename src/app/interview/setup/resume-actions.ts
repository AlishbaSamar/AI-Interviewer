"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { uploadResume } from "@/lib/cloudinary";

export type UploadResumeResult =
  | { success: true; url: string }
  | { success: false; error: string };

export async function uploadResumeAction(formData: FormData): Promise<UploadResumeResult> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { success: false, error: "You must be logged in to upload a resume." };
  }

  const file = formData.get("resume");

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Please choose a file to upload." };
  }

  try {
    const url = await uploadResume(file, session.user.id);
    return { success: true, url };
  } catch (err) {
    console.error("[resume-actions] failed to upload resume", err);
    const message =
      err instanceof Error ? err.message : "Failed to upload the resume. Please try again.";
    return { success: false, error: message };
  }
}

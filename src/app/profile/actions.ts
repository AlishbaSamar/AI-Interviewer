"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { uploadProfileImage } from "@/lib/cloudinary";

export type UploadAvatarResult =
  | { success: true; url: string }
  | { success: false; error: string };

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export async function uploadAvatarAction(formData: FormData): Promise<UploadAvatarResult> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { success: false, error: "You must be logged in to upload a profile picture." };
  }

  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Please choose an image to upload." };
  }

  if (!file.type.startsWith("image/")) {
    return { success: false, error: "Please choose an image file." };
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return { success: false, error: "Image must be smaller than 5MB." };
  }

  try {
    const url = await uploadProfileImage(file, session.user.id);
    return { success: true, url };
  } catch (err) {
    console.error("[profile actions] failed to upload avatar", err);
    const message =
      err instanceof Error ? err.message : "Failed to upload the image. Please try again.";
    return { success: false, error: message };
  }
}

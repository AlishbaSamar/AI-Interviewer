"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getInitials } from "@/lib/avatar";
import { AuthError, AuthField, AuthSubmitButton } from "@/components/auth-ui";
import { uploadAvatarAction } from "./actions";

function AvatarUpload({
  name,
  imageUrl,
  onImageUploaded,
}: {
  name: string;
  imageUrl: string | null;
  onImageUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.set("avatar", file);

    const result = await uploadAvatarAction(formData);

    if (!result.success) {
      setUploading(false);
      setError(result.error);
      return;
    }

    const { error: updateError } = await authClient.updateUser({ image: result.url });
    setUploading(false);

    if (updateError) {
      setError(updateError.message ?? "Failed to save the new photo. Please try again.");
      return;
    }

    onImageUploaded(result.url);
  }

  return (
    <div className="flex items-center gap-4">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="h-16 w-16 rounded-full border border-ink-border object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/40 bg-accent/15 font-display text-sm font-medium text-accent">
          {getInitials(name)}
        </div>
      )}

      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="text-sm text-ink-muted file:mr-3 file:rounded-md file:border file:border-ink-border file:bg-ink-surface-2 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink-fg disabled:opacity-50"
        />
        {uploading && <p className="mt-1.5 text-xs text-ink-muted">Uploading...</p>}
        {error && (
          <p role="alert" className="mt-1.5 text-xs text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export function ProfileForm({
  initialName,
  initialImage,
}: {
  initialName: string;
  initialImage: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [imageUrl, setImageUrl] = useState(initialImage);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError("");

    const { error } = await authClient.updateUser({ name });

    if (error) {
      setStatus("error");
      setError(error.message ?? "Something went wrong. Please try again.");
      return;
    }

    setStatus("saved");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <AvatarUpload
        name={name || initialName}
        imageUrl={imageUrl}
        onImageUploaded={(url) => {
          setImageUrl(url);
          router.refresh();
        }}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          id="name"
          label="Name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setStatus("idle");
          }}
          required
        />

        <AuthError>{status === "error" ? error : null}</AuthError>
        {status === "saved" && <p className="text-sm text-accent">Profile updated.</p>}

        <AuthSubmitButton loading={status === "saving"} loadingLabel="Saving...">
          Save changes
        </AuthSubmitButton>
      </form>
    </div>
  );
}

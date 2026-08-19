"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getInitials } from "@/lib/avatar";
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
          className="h-16 w-16 rounded-full border border-black/10 object-cover dark:border-white/10"
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-black/10 bg-black/5 text-sm font-medium text-foreground dark:border-white/10 dark:bg-white/5">
          {getInitials(name)}
        </div>
      )}

      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="text-sm text-foreground/60 file:mr-3 file:rounded-md file:border file:border-black/15 file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground disabled:opacity-50 dark:file:border-white/15"
        />
        {uploading && <p className="mt-1 text-xs text-foreground/60">Uploading...</p>}
        {error && (
          <p role="alert" className="mt-1 text-xs text-red-500">
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
    <div className="space-y-5">
      <AvatarUpload
        name={name || initialName}
        imageUrl={imageUrl}
        onImageUploaded={(url) => {
          setImageUrl(url);
          router.refresh();
        }}
      />

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setStatus("idle");
            }}
            required
            className="mt-1 w-full rounded-md border border-black/15 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40 dark:border-white/15"
          />
        </div>

        {status === "error" && <p className="text-sm text-red-500">{error}</p>}
        {status === "saved" && (
          <p className="text-sm text-green-600">Profile updated.</p>
        )}

        <button
          type="submit"
          disabled={status === "saving"}
          className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {status === "saving" ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}

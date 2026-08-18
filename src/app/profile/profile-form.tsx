"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function ProfileForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
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
  );
}

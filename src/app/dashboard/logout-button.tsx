"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-md px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink-fg"
    >
      Log out
    </button>
  );
}

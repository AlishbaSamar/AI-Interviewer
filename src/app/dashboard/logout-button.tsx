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
      className="rounded-md border border-black/15 px-3 py-2 text-sm font-medium text-foreground dark:border-white/15"
    >
      Log out
    </button>
  );
}

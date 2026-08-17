"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await authClient.signIn.email({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message ?? "Something went wrong. Please try again.");
      return;
    }

    router.push("/dashboard");
  }

  async function handleGoogleSignIn() {
    setError("");
    await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-black/10 bg-background p-8 shadow-sm dark:border-white/10">
        <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Log in to your account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-black/15 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40 dark:border-white/15"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-black/15 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40 dark:border-white/15"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          <span className="text-xs text-foreground/50">OR</span>
          <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="mt-4 w-full rounded-md border border-black/15 px-3 py-2 text-sm font-medium text-foreground dark:border-white/15"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-foreground/60">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-foreground underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

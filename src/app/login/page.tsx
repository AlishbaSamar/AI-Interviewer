"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  AuthCard,
  AuthDivider,
  AuthError,
  AuthField,
  AuthFooterLink,
  AuthHeading,
  AuthLayout,
  AuthSubmitButton,
  GoogleButton,
} from "@/components/auth-ui";

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
    <AuthLayout>
      <AuthCard>
        <AuthHeading title="Welcome back" subtitle="Log in to your account." />

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <AuthField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <AuthField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <AuthError>{error}</AuthError>

          <AuthSubmitButton loading={loading} loadingLabel="Logging in...">
            Log in
          </AuthSubmitButton>
        </form>

        <AuthDivider />

        <GoogleButton onClick={handleGoogleSignIn} />

        <AuthFooterLink
          prompt="Don't have an account?"
          linkText="Sign up"
          href="/signup"
        />
      </AuthCard>
    </AuthLayout>
  );
}

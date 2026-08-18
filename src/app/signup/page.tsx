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

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await authClient.signUp.email({ name, email, password });

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
        <AuthHeading title="Create your account" subtitle="Sign up to get started." />

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <AuthField
            id="name"
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />

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
            autoComplete="new-password"
            minLength={8}
            required
          />

          <AuthError>{error}</AuthError>

          <AuthSubmitButton loading={loading} loadingLabel="Signing up...">
            Sign up
          </AuthSubmitButton>
        </form>

        <AuthDivider />

        <GoogleButton onClick={handleGoogleSignIn} />

        <AuthFooterLink
          prompt="Already have an account?"
          linkText="Log in"
          href="/login"
        />
      </AuthCard>
    </AuthLayout>
  );
}

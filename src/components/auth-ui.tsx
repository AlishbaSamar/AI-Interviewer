import type { InputHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { WaveformBars } from "@/components/waveform-bars";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4 py-12">
      <WaveformBars
        count={48}
        seed={9}
        minHeight={10}
        className="pointer-events-none absolute inset-x-0 bottom-0 flex h-72 items-end justify-center gap-[6px] px-4 opacity-[0.06] [mask-image:linear-gradient(to_top,black,transparent)]"
        barClassName="w-[3px] flex-1 max-w-[6px] rounded-full bg-gradient-to-t from-accent to-accent-violet"
      />
      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  );
}

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-accent/15 bg-ink-surface p-6 shadow-[0_0_60px_-20px_rgba(94,234,212,0.35)] sm:p-8">
      {children}
    </div>
  );
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-medium tracking-tight text-ink-fg">
        {title}
      </h1>
      <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
    </div>
  );
}

export function AuthField({
  id,
  label,
  ...inputProps
}: { id: string; label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink-fg">
        {label}
      </label>
      <input
        id={id}
        name={id}
        {...inputProps}
        className="mt-1.5 w-full rounded-md border border-ink-border bg-ink-surface-2 px-3 py-2.5 text-sm text-ink-fg outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25"
      />
    </div>
  );
}

export function AuthError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className="rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400"
    >
      {children}
    </p>
  );
}

export function AuthSubmitButton({
  loading,
  loadingLabel,
  children,
}: {
  loading: boolean;
  loadingLabel: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-surface disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 rounded-full border-2 border-ink/30 border-t-ink motion-safe:animate-spin"
        />
      )}
      {loading ? loadingLabel : children}
    </button>
  );
}

export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-ink-border" />
      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
        Or
      </span>
      <div className="h-px flex-1 bg-ink-border" />
    </div>
  );
}

export function GoogleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2.5 rounded-md border border-ink-border px-4 py-2.5 text-sm font-medium text-ink-fg transition-colors hover:border-ink-fg/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
    >
      <GoogleIcon />
      Continue with Google
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.9-2.26 5.36-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.87.92 7.53 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export function AuthFooterLink({
  prompt,
  linkText,
  href,
}: {
  prompt: string;
  linkText: string;
  href: string;
}) {
  return (
    <p className="mt-6 text-center text-sm text-ink-muted">
      {prompt}{" "}
      <Link
        href={href}
        className="font-medium text-accent underline-offset-2 hover:underline focus-visible:underline focus-visible:outline-none"
      >
        {linkText}
      </Link>
    </p>
  );
}

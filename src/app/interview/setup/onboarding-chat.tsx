"use client";

import { useState } from "react";
import { useOnboardingStore } from "./onboarding-store";
import { sendOnboardingMessage } from "./onboarding-actions";

const SKIP_AFTER_TURNS = 8;

export function OnboardingChat() {
  const messages = useOnboardingStore((s) => s.messages);
  const pushMessage = useOnboardingStore((s) => s.pushMessage);
  const setProfileDraft = useOnboardingStore((s) => s.setProfileDraft);
  const skipToConfirm = useOnboardingStore((s) => s.skipToConfirm);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const userTurns = messages.filter((m) => m.role === "user").length;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setError("");
    setSending(true);
    setInput("");

    const history = messages;
    pushMessage({ role: "user", text });

    const result = await sendOnboardingMessage(history, text);
    setSending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    pushMessage({ role: "assistant", text: result.reply });
    if (result.profileDraft) {
      setProfileDraft(result.profileDraft);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-medium tracking-tight text-ink-fg">
        Let&apos;s set up your interview
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        Tell me a bit about what you&apos;d like to practice.
      </p>

      <div className="mt-6 h-80 space-y-3 overflow-y-auto rounded-lg border border-ink-border bg-ink-surface-2 p-3">
        {messages.length === 0 && (
          <p className="text-sm text-ink-muted">
            Say hello to get started - e.g. &quot;I want to practice a coding
            interview for a frontend role.&quot;
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-auto bg-accent text-ink"
                : "border border-ink-border bg-ink text-ink-fg"
            }`}
          >
            {m.text}
          </div>
        ))}
        {sending && <p className="text-sm text-ink-muted">Thinking...</p>}
      </div>

      {error && (
        <p role="alert" className="mt-2 rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={sending}
          className="flex-1 rounded-md border border-ink-border bg-ink-surface-2 px-3 py-2 text-sm text-ink-fg outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </form>

      {userTurns >= SKIP_AFTER_TURNS && (
        <button
          type="button"
          onClick={skipToConfirm}
          className="mt-3 rounded text-sm font-medium text-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          Skip to manual setup
        </button>
      )}
    </div>
  );
}

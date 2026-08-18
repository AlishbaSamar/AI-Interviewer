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
      <h1 className="text-2xl font-semibold text-foreground">
        Let&apos;s set up your interview
      </h1>
      <p className="mt-1 text-sm text-foreground/60">
        Tell me a bit about what you&apos;d like to practice.
      </p>

      <div className="mt-6 h-80 space-y-3 overflow-y-auto rounded-md border border-black/10 bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.02]">
        {messages.length === 0 && (
          <p className="text-sm text-foreground/40">
            Say hello to get started - e.g. &quot;I want to practice a coding
            interview for a frontend role.&quot;
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-md px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-auto bg-foreground text-background"
                : "bg-background text-foreground border border-black/10 dark:border-white/10"
            }`}
          >
            {m.text}
          </div>
        ))}
        {sending && (
          <p className="text-sm text-foreground/40">Thinking...</p>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={sending}
          className="flex-1 rounded-md border border-black/15 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40 disabled:opacity-50 dark:border-white/15"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          Send
        </button>
      </form>

      {userTurns >= SKIP_AFTER_TURNS && (
        <button
          type="button"
          onClick={skipToConfirm}
          className="mt-3 text-sm text-foreground/60 underline"
        >
          Skip to manual setup
        </button>
      )}
    </div>
  );
}

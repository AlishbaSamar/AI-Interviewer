"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Vapi from "@vapi-ai/web";
import type { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import type { InterviewSession } from "@/generated/prisma/client";
import { buildInterviewPrompt, buildProgressTool, PROGRESS_TOOL_NAME } from "@/lib/interview-prompt";
import { PARAMETER_LABELS, type InterviewFeedback } from "@/lib/interview-types";
import { WaveformBars } from "@/components/waveform-bars";
import {
  getInterviewFeedback,
  saveInterviewTranscript,
  type TranscriptLine,
} from "./actions";

type Status = "idle" | "connecting" | "connected" | "ended";

type SaveStatus = "idle" | "saving" | "saved" | "error";

type FeedbackStatus = "idle" | "loading" | "loaded" | "error";

/** Who the waveform + status text should represent right now. */
type ActiveSpeaker = "idle" | "connecting" | "ai" | "user" | "ended";

const STATUS_TEXT: Record<ActiveSpeaker, string> = {
  idle: "Ready to begin",
  connecting: "Connecting...",
  ai: "AI is speaking...",
  user: "Listening...",
  ended: "Call ended",
};

export function InterviewClient({ session }: { session: InterviewSession }) {
  const vapiRef = useRef<Vapi | null>(null);
  const transcriptRef = useRef<TranscriptLine[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [assistantSpeaking, setAssistantSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus>("idle");
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [feedbackError, setFeedbackError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const saveTranscript = useCallback(async () => {
    const currentTranscript = transcriptRef.current;
    if (currentTranscript.length === 0) return;

    setSaveStatus("saving");
    setSaveError("");

    try {
      const result = await saveInterviewTranscript(session.id, currentTranscript);
      if (result.success) {
        setSaveStatus("saved");
      } else {
        setSaveStatus("error");
        setSaveError(result.error);
      }
    } catch (err) {
      console.error("[interview] failed to save transcript", err);
      setSaveStatus("error");
      setSaveError("Failed to save the transcript. Check your connection and try again.");
    }
  }, [session.id]);

  useEffect(() => {
    if (!publicKey) return;

    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      console.log("[vapi event] call-start");
      setStatus("connected");
    });

    vapi.on("call-end", () => {
      console.log("[vapi event] call-end");
      setStatus("ended");
      setAssistantSpeaking(false);
      void saveTranscript();
    });

    vapi.on("speech-start", () => setAssistantSpeaking(true));
    vapi.on("speech-end", () => setAssistantSpeaking(false));

    vapi.on("message", (message) => {
      console.log("[vapi event] message", message);
      if (message?.type === "transcript" && message.transcriptType === "final") {
        setTranscript((prev) => [
          ...prev,
          { role: message.role, text: message.transcript },
        ]);
      }

      // Best-effort progress indicator - the interviewer model reports its
      // question number via a client-observation-only tool call. If this
      // never fires (e.g. the model doesn't call it), the UI just doesn't
      // show a question count rather than breaking anything.
      if (message?.type === "tool-calls" && Array.isArray(message.toolCallList)) {
        for (const call of message.toolCallList) {
          if (call?.function?.name !== PROGRESS_TOOL_NAME) continue;
          try {
            // Vapi's types say `arguments` is always a JSON string, but in
            // practice the client SDK sometimes delivers it pre-parsed as an
            // object - handle both.
            const raw = call.function.arguments;
            const args = typeof raw === "string" ? JSON.parse(raw) : raw;
            if (typeof args?.questionNumber === "number") {
              setCurrentQuestion(args.questionNumber);
            }
          } catch (err) {
            console.error("[vapi] failed to parse progress tool arguments", err);
          }
        }
      }
    });

    vapi.on("error", (err) => {
      console.error("[vapi event] error", err);
      setError(err?.message ?? "Something went wrong with the call.");
      setStatus("ended");
      setAssistantSpeaking(false);
    });

    return () => {
      vapi.stop();
      vapi.removeAllListeners();
    };
  }, [publicKey, saveTranscript]);

  async function handleStartCall() {
    setError("");
    setTranscript([]);
    setSaveStatus("idle");
    setSaveError("");
    setFeedbackStatus("idle");
    setFeedback(null);
    setFeedbackError("");
    setCurrentQuestion(null);
    setIsMuted(false);
    setAssistantSpeaking(false);
    setStatus("connecting");

    const { systemPrompt, firstMessage } = buildInterviewPrompt(session);

    // Voice/model/transcriber match the known-working "New Assistant" in the
    // Vapi dashboard (id 9bb1f043-bd38-4fe1-bc20-e314e6a0343d) - only the
    // system prompt and first message are generated per session.
    const assistantConfig: CreateAssistantDTO = {
      voice: {
        provider: "vapi",
        voiceId: "Elliot",
      },
      model: {
        provider: "openai",
        model: "gpt-4.1",
        messages: [{ role: "system", content: systemPrompt }],
        tools: [buildProgressTool(session.numQuestions)],
      },
      transcriber: {
        provider: "soniox",
        model: "stt-rt-v5",
        language: "en",
        languages: ["en"],
        fallbackPlan: { autoFallback: { enabled: true } },
      } as unknown as CreateAssistantDTO["transcriber"],
      firstMessage,
    };

    try {
      console.log("Starting call for session:", session.id, assistantConfig);
      await vapiRef.current?.start(assistantConfig);
    } catch (err) {
      console.error("[vapi] failed to start call", err);
      setError("Failed to start the call. Check the console for details.");
      setStatus("idle");
    }
  }

  function handleEndCall() {
    vapiRef.current?.stop();
    setStatus("ended");
    setAssistantSpeaking(false);
  }

  function handleTogglePause() {
    const next = !isMuted;
    vapiRef.current?.setMuted(next);
    setIsMuted(next);
  }

  async function handleGetFeedback() {
    setFeedbackStatus("loading");
    setFeedbackError("");

    try {
      const result = await getInterviewFeedback(session.id);
      if (result.success) {
        setFeedback(result.feedback);
        setFeedbackStatus("loaded");
      } else {
        setFeedbackStatus("error");
        setFeedbackError(result.error);
      }
    } catch (err) {
      console.error("[interview] failed to get feedback", err);
      setFeedbackStatus("error");
      setFeedbackError("Failed to get feedback. Check your connection and try again.");
    }
  }

  const canStart = (status === "idle" || status === "ended") && Boolean(publicKey);
  const canEnd = status === "connecting" || status === "connected";

  const activeSpeaker: ActiveSpeaker =
    status === "idle"
      ? "idle"
      : status === "connecting"
        ? "connecting"
        : status === "ended"
          ? "ended"
          : assistantSpeaking
            ? "ai"
            : "user";

  function handlePrimaryAction() {
    if (canEnd) {
      handleEndCall();
    } else if (canStart) {
      void handleStartCall();
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink text-ink-fg">
      <header className="px-6 pt-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <Link
            href="/dashboard"
            className="self-start font-mono text-xs text-ink-muted transition-colors hover:text-ink-fg sm:self-auto"
          >
            ← Dashboard
          </Link>
          <p className="text-center font-mono text-xs uppercase tracking-widest text-ink-muted">
            {session.interviewType} · {session.difficulty} · {session.mode} mode
          </p>
          <span className="hidden w-16 sm:inline" aria-hidden="true" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-6 pb-16">
        {/* Central focus area - the emotional center of the screen */}
        <div className="flex w-full flex-1 flex-col items-center justify-center py-10">
          <WaveformStage activeSpeaker={activeSpeaker} />

          <p className="mt-8 text-center font-display text-2xl font-medium tracking-tight text-ink-fg sm:text-3xl">
            {STATUS_TEXT[activeSpeaker]}
          </p>

          <div className="mt-3 flex min-h-5 items-center gap-3 font-mono text-xs text-ink-muted">
            {isMuted && status === "connected" && <span>Muted</span>}
            {currentQuestion !== null && status === "connected" && (
              <span>
                Question {currentQuestion} of {session.numQuestions}
              </span>
            )}
          </div>

          {(error || !publicKey) && (
            <p className="mt-4 max-w-sm text-center text-sm text-red-400">
              {error || "NEXT_PUBLIC_VAPI_PUBLIC_KEY is not set."}
            </p>
          )}

          <div className="mt-10 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handlePrimaryAction}
              disabled={!canStart && !canEnd}
              className={`rounded-full px-10 py-4 text-base font-semibold transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 ${
                canEnd
                  ? "bg-red-500 text-white"
                  : "bg-accent text-ink"
              }`}
            >
              {canEnd ? "End Call" : "Start Call"}
            </button>

            {status === "connected" && (
              <button
                type="button"
                onClick={handleTogglePause}
                className="rounded-full border border-ink-border px-4 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-ink-fg"
              >
                {isMuted ? "Unmute mic" : "Mute mic"}
              </button>
            )}
          </div>
        </div>

        {/* Calm confirmation once the call has ended and the transcript is saved */}
        {saveStatus === "saving" && (
          <p className="text-sm text-ink-muted">Saving transcript...</p>
        )}

        {saveStatus === "error" && (
          <div className="w-full max-w-sm rounded-lg border border-red-500/25 bg-red-500/5 p-4 text-center">
            <p className="text-sm text-red-400">{saveError}</p>
            <p className="mt-1 text-xs text-ink-muted">
              Your transcript is still shown below and hasn&apos;t been lost.
            </p>
            <button
              type="button"
              onClick={() => void saveTranscript()}
              className="mt-3 rounded-md border border-ink-border px-3 py-1.5 text-xs font-medium text-ink-fg"
            >
              Retry save
            </button>
          </div>
        )}

        {saveStatus === "saved" && (
          <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-xl border border-ink-border bg-ink-surface px-6 py-6 text-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/40 text-accent">
              <CheckIcon />
            </span>
            <p className="text-sm text-ink-fg">
              Interview completed, transcript saved.
            </p>

            {feedbackStatus === "idle" && (
              <button
                type="button"
                onClick={handleGetFeedback}
                className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-ink"
              >
                Get Feedback
              </button>
            )}

            {feedbackStatus === "loading" && (
              <p className="text-sm text-ink-muted">
                Generating feedback... this may take a moment.
              </p>
            )}

            {feedbackStatus === "error" && (
              <div className="w-full rounded-md border border-red-500/25 bg-red-500/5 p-3">
                <p className="text-sm text-red-400">{feedbackError}</p>
                <button
                  type="button"
                  onClick={handleGetFeedback}
                  className="mt-2 rounded-md border border-ink-border px-2.5 py-1 text-xs font-medium text-ink-fg"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        )}

        {/* Feedback results - reading content, kept plain and legible */}
        {feedbackStatus === "loaded" && feedback && (
          <div className="mt-10 w-full max-w-xl">
            <div className="flex items-baseline justify-center gap-2">
              <span className="font-display text-6xl font-medium text-ink-fg">
                {feedback.overallScore}
              </span>
              <span className="text-sm text-ink-muted">/ 100 overall</span>
            </div>

            <div className="mt-8 space-y-3">
              {PARAMETER_LABELS.map(({ key, label }, i) => (
                <div key={key}>
                  <div className="flex justify-between text-xs text-ink-muted">
                    <span>{label}</span>
                    <span className="font-mono">{feedback.parameters[key]}/100</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-ink-surface-2">
                    <div
                      className={`h-1.5 rounded-full ${i % 2 === 0 ? "bg-accent" : "bg-accent-violet"}`}
                      style={{ width: `${feedback.parameters[key]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 space-y-8 border-t border-ink-border pt-8">
              <FeedbackList title="Strengths" items={feedback.strengths} />
              <FeedbackList title="Weaknesses" items={feedback.weaknesses} />
              <FeedbackList title="Suggestions" items={feedback.suggestions} />
              <ExampleAnswers items={feedback.exampleAnswers} />
            </div>

            <a
              href={`/interview/${session.id}/report`}
              download={`interview-report-${session.id}.pdf`}
              className="mt-8 block w-full rounded-md border border-ink-border px-3 py-2.5 text-center text-sm font-medium text-ink-fg transition-colors hover:border-ink-fg/40"
            >
              Download PDF Report
            </a>
          </div>
        )}

        {/* Transcript - collapsed by default, never the visual focus */}
        <div className="mt-12 w-full max-w-xl">
          <button
            type="button"
            onClick={() => setTranscriptOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border border-ink-border bg-ink-surface px-4 py-3 text-left"
          >
            <span className="text-sm font-medium text-ink-fg">
              Transcript
              {transcript.length > 0 && (
                <span className="ml-2 font-mono text-xs text-ink-muted">
                  {transcript.length}
                </span>
              )}
            </span>
            <span
              className={`text-ink-muted transition-transform motion-safe:duration-200 ${transcriptOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>

          {transcriptOpen && (
            <div className="mt-2 max-h-72 overflow-y-auto rounded-lg border border-ink-border bg-ink-surface/60 p-4 text-sm">
              {transcript.length === 0 ? (
                <p className="text-ink-muted">
                  Nothing said yet. Start the call to begin.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {transcript.map((line, i) => (
                    <li key={i}>
                      <span className="font-medium text-ink-fg">
                        {line.role === "assistant" ? "Interviewer" : "You"}:
                      </span>{" "}
                      <span className="text-ink-muted">{line.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function WaveformStage({ activeSpeaker }: { activeSpeaker: ActiveSpeaker }) {
  const config = {
    idle: { active: false, sync: false, speed: 1, barClassName: "bg-ink-border", glow: "" },
    connecting: {
      active: true,
      sync: true,
      speed: 2.6,
      barClassName: "bg-accent/45",
      glow: "bg-accent/10",
    },
    ai: {
      active: true,
      sync: false,
      speed: 0.6,
      barClassName: "bg-accent",
      glow: "bg-accent/20",
    },
    user: {
      active: true,
      sync: false,
      speed: 0.6,
      barClassName: "bg-accent-violet",
      glow: "bg-accent-violet/20",
    },
    ended: { active: false, sync: false, speed: 1, barClassName: "bg-ink-border", glow: "" },
  }[activeSpeaker];

  return (
    <div className="relative flex h-56 w-full max-w-md items-center justify-center sm:h-64">
      {config.glow && (
        <div
          aria-hidden="true"
          className={`absolute h-40 w-40 rounded-full blur-3xl transition-colors motion-safe:duration-500 ${config.glow}`}
        />
      )}
      <WaveformBars
        count={28}
        seed={7}
        minHeight={10}
        active={config.active}
        sync={config.sync}
        speed={config.speed}
        flatHeight={12}
        className="relative flex h-32 w-full items-end justify-center gap-1.5 px-2 sm:h-40"
        barClassName={`min-w-0 flex-1 max-w-2 rounded-full transition-colors motion-safe:duration-300 ${config.barClassName}`}
      />
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M5 12.5l4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FeedbackList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="font-mono text-xs uppercase tracking-widest text-ink-muted">
        {title}
      </h3>
      <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm leading-relaxed text-ink-fg/90">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ExampleAnswers({
  items,
}: {
  items: InterviewFeedback["exampleAnswers"];
}) {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <h3 className="font-mono text-xs uppercase tracking-widest text-ink-muted">
        Example Answers
      </h3>
      <div className="mt-2 space-y-4">
        {items.map((item, i) => (
          <div key={i}>
            <p className="text-sm font-medium text-ink-fg">{item.question}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              {item.modelAnswer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import type { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import type { InterviewSession } from "@/generated/prisma/client";
import { buildInterviewPrompt, buildProgressTool, PROGRESS_TOOL_NAME } from "@/lib/interview-prompt";
import { PARAMETER_LABELS, type InterviewFeedback } from "@/lib/interview-types";
import {
  getInterviewFeedback,
  saveInterviewTranscript,
  type TranscriptLine,
} from "./actions";

type Status = "idle" | "connecting" | "connected" | "ended";

type SaveStatus = "idle" | "saving" | "saved" | "error";

type FeedbackStatus = "idle" | "loading" | "loaded" | "error";

const STATUS_LABEL: Record<Status, string> = {
  idle: "Idle",
  connecting: "Connecting...",
  connected: "Connected",
  ended: "Ended",
};

export function InterviewClient({ session }: { session: InterviewSession }) {
  const vapiRef = useRef<Vapi | null>(null);
  const transcriptRef = useRef<TranscriptLine[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
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
      void saveTranscript();
    });

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg rounded-xl border border-black/10 bg-background p-8 shadow-sm dark:border-white/10">
        <h1 className="text-2xl font-semibold text-foreground">
          {session.interviewType} Interview
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          {session.difficulty} difficulty · {session.numQuestions} questions ·{" "}
          {session.mode}
        </p>

        <div className="mt-6 flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              status === "connected"
                ? "bg-green-500"
                : status === "connecting"
                  ? "bg-yellow-500"
                  : status === "ended"
                    ? "bg-red-500"
                    : "bg-foreground/30"
            }`}
          />
          <span className="text-sm font-medium text-foreground">
            {STATUS_LABEL[status]}
            {isMuted && status === "connected" && " · Paused"}
          </span>
          {currentQuestion !== null && (
            <span className="ml-auto text-sm text-foreground/50">
              Question {currentQuestion} of {session.numQuestions}
            </span>
          )}
        </div>

        {(error || !publicKey) && (
          <p className="mt-3 text-sm text-red-500">
            {error || "NEXT_PUBLIC_VAPI_PUBLIC_KEY is not set."}
          </p>
        )}

        {saveStatus === "saving" && (
          <p className="mt-3 text-sm text-foreground/60">Saving transcript...</p>
        )}
        {saveStatus === "saved" && (
          <p className="mt-3 text-sm text-green-600">
            Interview completed, transcript saved.
          </p>
        )}
        {saveStatus === "error" && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30">
            <p className="text-sm text-red-500">{saveError}</p>
            <p className="mt-1 text-xs text-foreground/50">
              Your transcript is still shown below and hasn&apos;t been lost.
            </p>
            <button
              type="button"
              onClick={() => void saveTranscript()}
              className="mt-2 rounded-md border border-black/15 px-2.5 py-1 text-xs font-medium text-foreground dark:border-white/15"
            >
              Retry save
            </button>
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleStartCall}
            disabled={!canStart}
            className="flex-1 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
          >
            Start Call
          </button>
          <button
            type="button"
            onClick={handleTogglePause}
            disabled={status !== "connected"}
            className="flex-1 rounded-md border border-black/15 px-3 py-2 text-sm font-medium text-foreground disabled:opacity-50 dark:border-white/15"
          >
            {isMuted ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            onClick={handleEndCall}
            disabled={!canEnd}
            className="flex-1 rounded-md border border-black/15 px-3 py-2 text-sm font-medium text-foreground disabled:opacity-50 dark:border-white/15"
          >
            End Call
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-medium text-foreground">Transcript</h2>
          <div className="mt-2 h-64 overflow-y-auto rounded-md border border-black/10 bg-black/[0.02] p-3 text-sm dark:border-white/10 dark:bg-white/[0.02]">
            {transcript.length === 0 ? (
              <p className="text-foreground/40">
                Nothing said yet. Start the call to begin.
              </p>
            ) : (
              <ul className="space-y-2">
                {transcript.map((line, i) => (
                  <li key={i}>
                    <span className="font-medium text-foreground">
                      {line.role === "assistant" ? "Interviewer" : "You"}:
                    </span>{" "}
                    <span className="text-foreground/80">{line.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {saveStatus === "saved" && (
          <div className="mt-6 border-t border-black/10 pt-6 dark:border-white/10">
            <h2 className="text-sm font-medium text-foreground">Feedback</h2>

            {feedbackStatus === "idle" && (
              <button
                type="button"
                onClick={handleGetFeedback}
                className="mt-3 w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background"
              >
                Get Feedback
              </button>
            )}

            {feedbackStatus === "loading" && (
              <p className="mt-3 text-sm text-foreground/60">
                Generating feedback... this may take a moment.
              </p>
            )}

            {feedbackStatus === "error" && (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30">
                <p className="text-sm text-red-500">{feedbackError}</p>
                <button
                  type="button"
                  onClick={handleGetFeedback}
                  className="mt-2 rounded-md border border-black/15 px-2.5 py-1 text-xs font-medium text-foreground dark:border-white/15"
                >
                  Retry
                </button>
              </div>
            )}

            {feedbackStatus === "loaded" && feedback && (
              <div className="mt-4 space-y-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-foreground">
                    {feedback.overallScore}
                  </span>
                  <span className="text-sm text-foreground/50">/ 100 overall</span>
                </div>

                <div className="space-y-3">
                  {PARAMETER_LABELS.map(({ key, label }) => (
                    <div key={key}>
                      <div className="flex justify-between text-xs text-foreground/70">
                        <span>{label}</span>
                        <span>{feedback.parameters[key]}/100</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-black/10 dark:bg-white/10">
                        <div
                          className="h-1.5 rounded-full bg-foreground"
                          style={{ width: `${feedback.parameters[key]}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <FeedbackList title="Strengths" items={feedback.strengths} />
                <FeedbackList title="Weaknesses" items={feedback.weaknesses} />
                <FeedbackList title="Suggestions" items={feedback.suggestions} />
                <ExampleAnswers items={feedback.exampleAnswers} />

                <a
                  href={`/interview/${session.id}/report`}
                  download={`interview-report-${session.id}.pdf`}
                  className="block w-full rounded-md border border-black/15 px-3 py-2 text-center text-sm font-medium text-foreground dark:border-white/15"
                >
                  Download PDF Report
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FeedbackList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-wide text-foreground/50">
        {title}
      </h3>
      <ul className="mt-1.5 list-inside list-disc space-y-1 text-sm text-foreground/80">
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
      <h3 className="text-xs font-medium uppercase tracking-wide text-foreground/50">
        Example Answers
      </h3>
      <div className="mt-1.5 space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-md border border-black/10 p-3 dark:border-white/10"
          >
            <p className="text-sm font-medium text-foreground">{item.question}</p>
            <p className="mt-1 text-sm text-foreground/70">{item.modelAnswer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

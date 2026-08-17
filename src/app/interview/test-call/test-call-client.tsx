"use client";

import { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";

type Status = "idle" | "connecting" | "connected" | "ended";

type TranscriptLine = {
  role: "assistant" | "user";
  text: string;
};

const ASSISTANT_ID = "9bb1f043-bd38-4fe1-bc20-e314e6a0343d";

const STATUS_LABEL: Record<Status, string> = {
  idle: "Idle",
  connecting: "Connecting...",
  connected: "Connected",
  ended: "Ended",
};

export function TestCallClient() {
  const vapiRef = useRef<Vapi | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [error, setError] = useState("");

  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

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
    });

    vapi.on("message", (message) => {
      console.log("[vapi event] message", message);
      if (message?.type === "transcript" && message.transcriptType === "final") {
        setTranscript((prev) => [
          ...prev,
          { role: message.role, text: message.transcript },
        ]);
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
  }, [publicKey]);

  async function handleStartCall() {
    setError("");
    setTranscript([]);
    setStatus("connecting");

    try {
      console.log(`Starting call with assistant ID: ${ASSISTANT_ID}`);
      await vapiRef.current?.start(ASSISTANT_ID);
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

  const canStart = (status === "idle" || status === "ended") && Boolean(publicKey);
  const canEnd = status === "connecting" || status === "connected";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg rounded-xl border border-black/10 bg-background p-8 shadow-sm dark:border-white/10">
        <h1 className="text-2xl font-semibold text-foreground">
          Vapi voice test call
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          A throwaway page to prove voice interaction works end to end.
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
          </span>
        </div>

        {(error || !publicKey) && (
          <p className="mt-3 text-sm text-red-500">
            {error || "NEXT_PUBLIC_VAPI_PUBLIC_KEY is not set."}
          </p>
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
      </div>
    </div>
  );
}

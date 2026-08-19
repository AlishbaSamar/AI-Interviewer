"use client";

import { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import type { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import {
  buildOnboardingPrompt,
  buildOnboardingProfileTool,
  ONBOARDING_PROFILE_TOOL_NAME,
} from "@/lib/onboarding-prompt";
import { pickOnboardingPersonas } from "@/lib/persona-names";
import type { OnboardingProfile } from "@/lib/interview-types";
import { WaveformBars } from "@/components/waveform-bars";
import { useOnboardingStore } from "./onboarding-store";

type Status = "idle" | "connecting" | "connected" | "ended";
type ActiveSpeaker = "idle" | "connecting" | "agent" | "user" | "ended";

const STATUS_TEXT: Record<ActiveSpeaker, string> = {
  idle: "Ready when you are",
  connecting: "Connecting...",
  agent: "Speaking...",
  user: "Listening...",
  ended: "Call ended",
};

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

/** Parses the raw tool-call arguments (numQuestions arrives as a string enum, optional fields may be omitted). */
function parseOnboardingProfile(value: unknown): OnboardingProfile | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;

  const numQuestions = Number(v.numQuestions);
  if (
    typeof v.interviewType !== "string" ||
    !Number.isFinite(numQuestions) ||
    typeof v.difficulty !== "string" ||
    typeof v.mode !== "string"
  ) {
    return null;
  }

  return {
    interviewType: v.interviewType,
    numQuestions,
    difficulty: v.difficulty,
    mode: v.mode,
    domain: nullableString(v.domain),
    experienceLevel: nullableString(v.experienceLevel),
    techStack: nullableString(v.techStack),
    targetRole: nullableString(v.targetRole),
  };
}

export function OnboardingVoice() {
  const vapiRef = useRef<Vapi | null>(null);
  const profileRef = useRef<OnboardingProfile | null>(null);
  const pendingHangupRef = useRef(false);

  const personas = useOnboardingStore((s) => s.personas);
  const setPersonas = useOnboardingStore((s) => s.setPersonas);
  const transcript = useOnboardingStore((s) => s.transcript);
  const setTranscript = useOnboardingStore((s) => s.setTranscript);
  const appendTranscriptLine = useOnboardingStore((s) => s.appendTranscriptLine);
  const profileDraft = useOnboardingStore((s) => s.profileDraft);
  const setProfileDraft = useOnboardingStore((s) => s.setProfileDraft);
  const setStep = useOnboardingStore((s) => s.setStep);
  const skipToConfirm = useOnboardingStore((s) => s.skipToConfirm);

  const [status, setStatus] = useState<Status>("idle");
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [error, setError] = useState("");

  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

  useEffect(() => {
    profileRef.current = profileDraft;
  }, [profileDraft]);

  useEffect(() => {
    if (!publicKey) return;

    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    vapi.on("call-start", () => setStatus("connected"));

    vapi.on("call-end", () => {
      setStatus("ended");
      setAgentSpeaking(false);
      if (profileRef.current) {
        setStep("confirm");
      }
    });

    vapi.on("speech-start", () => setAgentSpeaking(true));
    vapi.on("speech-end", () => {
      setAgentSpeaking(false);
      // Once the profile tool has fired, the agent's very next turn is its
      // scripted closing line - hang up right after it finishes speaking
      // instead of relying on the model to end the call itself.
      if (pendingHangupRef.current) {
        pendingHangupRef.current = false;
        setTimeout(() => vapiRef.current?.stop(), 600);
      }
    });

    vapi.on("message", (message) => {
      if (message?.type === "transcript" && message.transcriptType === "final") {
        appendTranscriptLine({ role: message.role, text: message.transcript });
      }

      if (message?.type === "tool-calls" && Array.isArray(message.toolCallList)) {
        for (const call of message.toolCallList) {
          if (call?.function?.name !== ONBOARDING_PROFILE_TOOL_NAME) continue;
          try {
            const raw = call.function.arguments;
            const args = typeof raw === "string" ? JSON.parse(raw) : raw;
            const profile = parseOnboardingProfile(args);
            if (profile) {
              setProfileDraft(profile);
              pendingHangupRef.current = true;
            }
          } catch (err) {
            console.error("[onboarding-voice] failed to parse profile tool arguments", err);
          }
        }
      }
    });

    vapi.on("error", (err) => {
      console.error("[vapi event] error", err);
      setError(err?.message ?? "Something went wrong with the call.");
      setStatus("ended");
      setAgentSpeaking(false);
    });

    return () => {
      vapi.stop();
      vapi.removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

  async function handleStartCall() {
    setError("");
    setTranscript([]);
    setProfileDraft(null);
    pendingHangupRef.current = false;
    setStatus("connecting");

    const generatedPersonas = pickOnboardingPersonas();
    setPersonas(generatedPersonas);

    const { systemPrompt, firstMessage } = buildOnboardingPrompt(generatedPersonas);

    const assistantConfig: CreateAssistantDTO = {
      voice: {
        provider: "vapi",
        voiceId: "Elliot",
      },
      model: {
        provider: "openai",
        model: "gpt-4.1",
        messages: [{ role: "system", content: systemPrompt }],
        tools: [buildOnboardingProfileTool()],
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
      await vapiRef.current?.start(assistantConfig);
    } catch (err) {
      console.error("[vapi] failed to start onboarding call", err);
      setError("Failed to start the call. Check the console for details.");
      setStatus("idle");
    }
  }

  function handleEndCall() {
    vapiRef.current?.stop();
    setStatus("ended");
    setAgentSpeaking(false);
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
          : agentSpeaking
            ? "agent"
            : "user";

  return (
    <div>
      <h1 className="font-display text-2xl font-medium tracking-tight text-ink-fg">
        Let&apos;s set up your interview
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        {personas
          ? `${personas.agentName} will ask you a few quick questions by voice.`
          : "Start the call and tell our onboarding assistant what you'd like to practice."}
      </p>

      <div className="mt-6 flex flex-col items-center rounded-lg border border-ink-border bg-ink-surface-2 px-4 py-8">
        <div className="relative flex h-28 w-full max-w-xs items-center justify-center">
          <WaveformBars
            count={22}
            seed={11}
            minHeight={8}
            active={status === "connected" || status === "connecting"}
            sync={status === "connecting"}
            speed={status === "connecting" ? 2.6 : 0.6}
            flatHeight={10}
            className="flex h-20 w-full items-end justify-center gap-1 px-2"
            barClassName={`min-w-0 flex-1 max-w-1.5 rounded-full transition-colors motion-safe:duration-300 ${
              activeSpeaker === "agent"
                ? "bg-accent"
                : activeSpeaker === "user"
                  ? "bg-accent-violet"
                  : "bg-ink-border"
            }`}
          />
        </div>
        <p className="mt-4 text-sm font-medium text-ink-fg">{STATUS_TEXT[activeSpeaker]}</p>

        {(error || !publicKey) && (
          <p className="mt-3 max-w-xs text-center text-xs text-red-400">
            {error || "NEXT_PUBLIC_VAPI_PUBLIC_KEY is not set."}
          </p>
        )}

        <button
          type="button"
          onClick={canEnd ? handleEndCall : () => void handleStartCall()}
          disabled={!canStart && !canEnd}
          className={`mt-6 rounded-full px-8 py-3 text-sm font-semibold transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 ${
            canEnd ? "bg-red-500 text-white" : "bg-accent text-ink"
          }`}
        >
          {canEnd ? "End Call" : status === "ended" ? "Call Again" : "Start Call"}
        </button>
      </div>

      {status === "ended" && !profileDraft && (
        <div className="mt-4 rounded-lg border border-red-500/25 bg-red-500/5 p-3 text-center">
          <p className="text-sm text-red-400">
            We couldn&apos;t catch all the details from that call.
          </p>
          <button
            type="button"
            onClick={skipToConfirm}
            className="mt-2 rounded text-xs font-medium text-accent underline-offset-2 hover:underline"
          >
            Skip to manual setup
          </button>
        </div>
      )}

      {transcript.length > 0 && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setTranscriptOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border border-ink-border bg-ink-surface px-4 py-3 text-left"
          >
            <span className="text-sm font-medium text-ink-fg">
              Transcript
              <span className="ml-2 font-mono text-xs text-ink-muted">{transcript.length}</span>
            </span>
            <span
              className={`text-ink-muted transition-transform motion-safe:duration-200 ${transcriptOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>

          {transcriptOpen && (
            <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-ink-border bg-ink-surface/60 p-4 text-sm">
              <ul className="space-y-2.5">
                {transcript.map((line, i) => (
                  <li key={i}>
                    <span className="font-medium text-ink-fg">
                      {line.role === "assistant" ? personas?.agentName ?? "Assistant" : "You"}:
                    </span>{" "}
                    <span className="text-ink-muted">{line.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

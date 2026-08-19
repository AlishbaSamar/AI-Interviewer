import type { ReactNode, RefObject } from "react";
import { getInitials } from "@/lib/avatar";
import { WaveformBars } from "@/components/waveform-bars";
import { RobotIcon } from "@/components/call-icons";

export type CallActiveSpeaker = "idle" | "connecting" | "ai" | "user" | "ended";

function tileBorderClass(role: "ai" | "user", activeSpeaker: CallActiveSpeaker): string {
  if (role === "ai" && activeSpeaker === "ai") {
    return "border-accent shadow-[0_0_0_3px_rgba(94,234,212,0.15)]";
  }
  if (role === "user" && activeSpeaker === "user") {
    return "border-accent-violet shadow-[0_0_0_3px_rgba(167,139,250,0.15)]";
  }
  return "border-ink-border";
}

function NameTag({ children }: { children: string }) {
  return (
    <span className="absolute bottom-3 left-3 rounded-md bg-ink/70 px-2 py-1 text-xs font-medium text-ink-fg backdrop-blur-sm">
      {children}
    </span>
  );
}

function AvatarCircle({
  children,
  tone,
  pulsing,
}: {
  children: ReactNode;
  tone: "accent" | "violet";
  pulsing: boolean;
}) {
  const toneClass =
    tone === "accent"
      ? "bg-accent/15 text-accent border-accent/40"
      : "bg-accent-violet/15 text-accent-violet border-accent-violet/40";

  return (
    <div className="relative flex items-center justify-center">
      {pulsing && (
        <span
          aria-hidden="true"
          className={`absolute h-20 w-20 rounded-full motion-safe:animate-[soft-pulse_1.6s_ease-in-out_infinite] ${
            tone === "accent" ? "bg-accent/10" : "bg-accent-violet/10"
          }`}
        />
      )}
      <div
        className={`relative flex h-16 w-16 items-center justify-center rounded-full border-2 font-display text-lg font-medium ${toneClass}`}
      >
        {children}
      </div>
    </div>
  );
}

export function CallStage({
  aiName,
  userName,
  userImage,
  activeSpeaker,
  cameraOn,
  videoRef,
}: {
  aiName: string;
  userName: string;
  userImage?: string | null;
  activeSpeaker: CallActiveSpeaker;
  cameraOn: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
}) {
  const dimmed = activeSpeaker === "idle";

  return (
    <div
      className={`grid w-full grid-cols-1 gap-3 transition-opacity motion-reduce:transition-none sm:grid-cols-2 ${dimmed ? "opacity-60" : "opacity-100"}`}
    >
      <div
        className={`relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border-2 bg-ink-surface transition-colors motion-safe:duration-300 ${tileBorderClass("ai", activeSpeaker)}`}
      >
        <div className="flex flex-col items-center gap-3">
          <AvatarCircle tone="accent" pulsing={activeSpeaker === "ai"}>
            <RobotIcon className="h-8 w-8" />
          </AvatarCircle>
          <WaveformBars
            count={14}
            seed={3}
            minHeight={15}
            active={activeSpeaker === "ai"}
            speed={0.6}
            flatHeight={10}
            className="flex h-4 w-24 items-end justify-center gap-[3px]"
            barClassName={`min-w-0 flex-1 max-w-1 rounded-full transition-colors motion-safe:duration-300 ${
              activeSpeaker === "ai" ? "bg-accent" : "bg-ink-border"
            }`}
          />
        </div>
        <NameTag>{aiName}</NameTag>
      </div>

      <div
        className={`relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border-2 bg-ink-surface transition-colors motion-safe:duration-300 ${tileBorderClass("user", activeSpeaker)}`}
      >
        {cameraOn ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="h-full w-full object-cover [transform:scaleX(-1)]"
          />
        ) : (
          <AvatarCircle tone="violet" pulsing={activeSpeaker === "user"}>
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userImage} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              getInitials(userName)
            )}
          </AvatarCircle>
        )}
        <NameTag>{userName}</NameTag>
      </div>
    </div>
  );
}

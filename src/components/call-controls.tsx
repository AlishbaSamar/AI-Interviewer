import { CameraIcon, CameraOffIcon, MicIcon, MicOffIcon, PhoneHangupIcon } from "./call-icons";

function ControlButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink ${
        active
          ? "border-ink-border bg-ink-surface-2 text-ink-fg hover:border-ink-fg/30"
          : "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/15"
      }`}
    >
      {children}
    </button>
  );
}

export function CallControls({
  isMuted,
  onToggleMute,
  cameraOn,
  onToggleCamera,
  onEndCall,
}: {
  isMuted: boolean;
  onToggleMute: () => void;
  cameraOn: boolean;
  onToggleCamera: () => void;
  onEndCall: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <ControlButton
        active={!isMuted}
        onClick={onToggleMute}
        label={isMuted ? "Unmute microphone" : "Mute microphone"}
      >
        {isMuted ? <MicOffIcon /> : <MicIcon />}
      </ControlButton>

      <ControlButton
        active={cameraOn}
        onClick={onToggleCamera}
        label={cameraOn ? "Turn camera off" : "Turn camera on"}
      >
        {cameraOn ? <CameraIcon /> : <CameraOffIcon />}
      </ControlButton>

      <button
        type="button"
        onClick={onEndCall}
        aria-label="End call"
        title="End call"
        className="flex h-12 w-16 items-center justify-center rounded-full bg-red-500 text-white transition-transform hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        <PhoneHangupIcon />
      </button>
    </div>
  );
}

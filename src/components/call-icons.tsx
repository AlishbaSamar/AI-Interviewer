type IconProps = { className?: string };

export function RobotIcon({ className = "h-8 w-8" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 2v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="2" r="1.3" fill="currentColor" />
      <rect x="4" y="6" width="16" height="14" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="9" cy="13" r="1.6" fill="currentColor" />
      <circle cx="15" cy="13" r="1.6" fill="currentColor" />
      <path d="M9 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 11H2M22 11h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function MicIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MicOffIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M9 5a3 3 0 0 1 6 0v6a3 3 0 0 1-.29 1.29M12 14a3 3 0 0 1-3-3v-1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M5 11a7 7 0 0 0 10.6 6M17.7 15.2A7 7 0 0 0 19 11M12 18v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CameraIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="6" width="13" height="12" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M16.5 10.5 21 8v8l-4.5-2.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CameraOffIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M16 8.5 21 6v12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 6H5.5A2.5 2.5 0 0 0 3 8.5V16a2.5 2.5 0 0 0 2.5 2.5H14a2.5 2.5 0 0 0 2.5-2.5v-1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PhoneHangupIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3.5 12.5c4-4.2 13-4.2 17 0a1 1 0 0 1 0 1.4l-2.4 2.4a1 1 0 0 1-1.3.1l-2.1-1.6a1 1 0 0 0-1.2 0c-.9.7-2.7.7-3.6 0a1 1 0 0 0-1.2 0l-2.1 1.6a1 1 0 0 1-1.3-.1L3.5 13.9a1 1 0 0 1 0-1.4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

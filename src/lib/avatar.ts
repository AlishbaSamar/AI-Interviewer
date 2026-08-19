/** Derives a 1-2 letter avatar label from a display name or email. */
export function getInitials(name: string | null | undefined): string {
  const trimmed = name?.trim();
  if (!trimmed) return "?";

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  const first = words[0] ?? trimmed;
  const localPart = first.split("@")[0];
  return localPart.slice(0, 2).toUpperCase();
}

const PERSONA_NAMES = [
  "Maya",
  "Jordan",
  "Sam",
  "Riya",
  "Alex",
  "Noah",
  "Priya",
  "Ethan",
  "Zoe",
  "Marcus",
  "Layla",
  "Owen",
  "Amara",
  "Leo",
  "Sofia",
  "Kai",
] as const;

export type OnboardingPersonas = {
  agentName: string;
  interviewerName: string;
};

/** Picks two distinct human first names: one for the onboarding agent, one for the interviewer it hands off to. */
export function pickOnboardingPersonas(): OnboardingPersonas {
  const agentName = PERSONA_NAMES[Math.floor(Math.random() * PERSONA_NAMES.length)];
  let interviewerName = agentName;
  while (interviewerName === agentName) {
    interviewerName = PERSONA_NAMES[Math.floor(Math.random() * PERSONA_NAMES.length)];
  }
  return { agentName, interviewerName };
}

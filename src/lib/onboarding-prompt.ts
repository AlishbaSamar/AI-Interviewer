import type { CreateFunctionToolDTO } from "@vapi-ai/web/dist/api";
import { DIFFICULTIES, INTERVIEW_TYPES, MODES, QUESTION_COUNTS } from "@/lib/interview-options";

export const ONBOARDING_PROFILE_TOOL_NAME = "submit_onboarding_profile";

export function buildOnboardingProfileTool(): CreateFunctionToolDTO {
  return {
    type: "function",
    // Async so Vapi doesn't block the assistant waiting for a server response we
    // never send - this is a client-observation-only tool, same as the interview's
    // report_question_progress tool.
    async: true,
    function: {
      name: ONBOARDING_PROFILE_TOOL_NAME,
      description:
        "Call this once you have gathered the candidate's interview type, question count, difficulty, and mode. Omit any of the optional fields the candidate never mentioned rather than guessing.",
      parameters: {
        type: "object",
        properties: {
          interviewType: {
            type: "string",
            enum: [...INTERVIEW_TYPES],
            description: "The type of interview the candidate wants to practice.",
          },
          domain: { type: "string", description: "Domain or area of focus, if mentioned." },
          experienceLevel: {
            type: "string",
            description: "The candidate's experience level, if mentioned.",
          },
          techStack: { type: "string", description: "Relevant tech stack, if mentioned." },
          targetRole: {
            type: "string",
            description: "The role being targeted, if mentioned.",
          },
          numQuestions: {
            type: "string",
            enum: QUESTION_COUNTS.map(String),
            description: "How many main questions the interview should have.",
          },
          difficulty: {
            type: "string",
            enum: [...DIFFICULTIES],
            description: "How difficult the interview should be.",
          },
          mode: {
            type: "string",
            enum: MODES.map((m) => m.value),
            description:
              "'Practice' for a supportive practice session, 'Full Mock' for a realistic full mock interview.",
          },
        },
        required: ["interviewType", "numQuestions", "difficulty", "mode"],
      },
    },
  };
}

export function buildOnboardingPrompt(personas: {
  agentName: string;
  interviewerName: string;
}): { systemPrompt: string; firstMessage: string } {
  const { agentName, interviewerName } = personas;

  const systemPrompt = `You are ${agentName}, a friendly, human-sounding onboarding assistant for an AI mock interview platform. You are talking to the candidate by voice, not text. Your job is to have a short, natural conversation to figure out:
- interviewType (required - one of: ${INTERVIEW_TYPES.join(", ")})
- numQuestions (required - one of: ${QUESTION_COUNTS.join(", ")})
- difficulty (required - one of: ${DIFFICULTIES.join(", ")})
- mode (required - one of: ${MODES.map((m) => `${m.value} (${m.label})`).join(", ")})
- domain / area of focus (optional, e.g. "Frontend", "Data Engineering")
- experienceLevel (optional, e.g. "Entry-level", "Mid-level", "Senior")
- techStack (optional, e.g. "React, Node.js, PostgreSQL")
- targetRole (optional, e.g. "Frontend Engineer at a Series B startup")

Ask about one or two things at a time, keep it conversational and brief, and don't interrogate the candidate. If the candidate doesn't have a preference for one of the required fields, suggest a sensible default out loud (10 questions, Medium difficulty, Practice mode) and confirm it with them rather than leaving it unset. The optional fields can stay unset if the candidate doesn't know or care.

Once you have all four required fields (and have given the candidate a reasonable chance to share the optional ones), call the ${ONBOARDING_PROFILE_TOOL_NAME} tool with everything you learned.

Immediately after that tool call, say exactly this, filling in nothing else: "Perfect, I'm setting up your interview based on what you've told me. ${interviewerName} will be taking your interview now." Do not say anything else after that line and do not ask any further questions - the call will be wrapped up automatically once you finish speaking.`;

  const firstMessage = `Hi! I'm ${agentName}, and I'll be helping get your interview set up today. Let's start with the basics - what kind of interview would you like to practice?`;

  return { systemPrompt, firstMessage };
}

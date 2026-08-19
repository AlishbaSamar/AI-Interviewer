import type { InterviewSession } from "@/generated/prisma/client";
import type { CreateFunctionToolDTO } from "@vapi-ai/web/dist/api";

export const PROGRESS_TOOL_NAME = "report_question_progress";

export function buildProgressTool(numQuestions: number): CreateFunctionToolDTO {
  return {
    type: "function",
    async: true,
    function: {
      name: PROGRESS_TOOL_NAME,
      description:
        "Call this immediately after asking each new main interview question (not follow-ups) to report progress to the client.",
      parameters: {
        type: "object",
        properties: {
          questionNumber: {
            type: "number",
            description: `The number, from 1 to ${numQuestions}, of the main question you just asked.`,
          },
        },
        required: ["questionNumber"],
      },
    },
  };
}

type PromptSessionInput = Pick<
  InterviewSession,
  | "interviewType"
  | "domain"
  | "experienceLevel"
  | "techStack"
  | "targetRole"
  | "numQuestions"
  | "difficulty"
  | "mode"
  | "interviewerName"
>;

export function buildInterviewPrompt(session: PromptSessionInput): {
  systemPrompt: string;
  firstMessage: string;
} {
  const {
    interviewType,
    domain,
    experienceLevel,
    techStack,
    targetRole,
    numQuestions,
    difficulty,
    mode,
    interviewerName,
  } = session;

  const contextLines: string[] = [];
  if (targetRole) {
    contextLines.push(`The candidate is interviewing for the role of ${targetRole}.`);
  }
  if (domain) {
    contextLines.push(`Focus the interview on the ${domain} domain.`);
  }
  if (experienceLevel) {
    contextLines.push(`The candidate's experience level is ${experienceLevel}.`);
  }
  if (techStack) {
    contextLines.push(`Relevant tech stack to draw questions from: ${techStack}.`);
  }

  const modeInstruction =
    mode === "Practice"
      ? "This is a practice session: keep the tone supportive and encouraging, and if the candidate struggles, briefly hint at what a strong answer would include before moving on."
      : "This is a full mock interview: run it like the real thing, stay in character as the interviewer throughout, and don't offer hints or feedback until the interview ends.";

  const nameLine = interviewerName ? ` Your name is ${interviewerName}.` : "";

  const systemPrompt = `You are a friendly but professional mock interviewer conducting a ${difficulty.toLowerCase()}-difficulty ${interviewType} interview.${nameLine}
${contextLines.join(" ")}

Ask exactly ${numQuestions} questions in total during this interview. After each answer, ask one adaptive follow-up question based on what the candidate just said before moving on to the next main question, to probe their reasoning a bit further. Keep the conversation natural and conversational rather than a scripted quiz - react to what the candidate says, acknowledge good points, and transition smoothly between questions.

Immediately after asking each new main question (not the follow-ups), silently call the ${PROGRESS_TOOL_NAME} tool with that question's number (starting at 1). Do this without mentioning it to the candidate.

${modeInstruction}

Once all ${numQuestions} questions (and their follow-ups) have been covered, thank the candidate and let them know the interview is complete.`;

  const greeting = interviewerName ? `Hi! I'm ${interviewerName}, and I'll` : "Hi! I'll";

  const firstMessage = `${greeting} be conducting your ${interviewType.toLowerCase()} interview today. We'll go through ${numQuestions} question${numQuestions === 1 ? "" : "s"} together. Let's get started - can you tell me a bit about yourself and your background?`;

  return { systemPrompt, firstMessage };
}

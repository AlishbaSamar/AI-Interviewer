import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources/chat/completions";
import { INTERVIEW_TYPES } from "@/lib/interview-options";
import { getLLMClient, LLM_MODEL } from "@/lib/llm-client";

export type OnboardingChatMessage = {
  role: "assistant" | "user";
  text: string;
};

export type ProfileDraft = {
  interviewType: string;
  domain: string | null;
  experienceLevel: string | null;
  techStack: string | null;
  targetRole: string | null;
};

export type OnboardingTurnResult = {
  reply: string;
  profileDraft: ProfileDraft | null;
};

const ONBOARDING_SYSTEM_PROMPT = `You are a friendly onboarding assistant for an AI mock interview platform. Your job is to have a short, natural conversation with the candidate to figure out:
- interviewType (required - one of: ${INTERVIEW_TYPES.join(", ")})
- domain / area of focus (optional, e.g. "Frontend", "Data Engineering")
- experienceLevel (optional, e.g. "Entry-level", "Mid-level", "Senior")
- techStack (optional, e.g. "React, Node.js, PostgreSQL")
- targetRole (optional, e.g. "Frontend Engineer at a Series B startup")

Ask about one or two things at a time, keep it conversational and brief, and don't interrogate the candidate. Only interviewType is required - if the candidate doesn't know or care about the others, that's fine, move on. Once you have interviewType and have given the candidate a reasonable chance to share the rest, call the submit_profile tool with what you learned (use null for anything not mentioned). Don't call the tool before you have at least the interviewType.`;

const SUBMIT_PROFILE_TOOL: ChatCompletionTool = {
  type: "function",
  function: {
    name: "submit_profile",
    description:
      "Submit the candidate's interview profile once enough information has been gathered from the conversation.",
    parameters: {
      type: "object",
      properties: {
        interviewType: {
          type: "string",
          enum: [...INTERVIEW_TYPES],
          description: "The type of interview the candidate wants to practice.",
        },
        domain: { type: ["string", "null"], description: "Domain or area of focus, if mentioned." },
        experienceLevel: {
          type: ["string", "null"],
          description: "The candidate's experience level, if mentioned.",
        },
        techStack: { type: ["string", "null"], description: "Relevant tech stack, if mentioned." },
        targetRole: { type: ["string", "null"], description: "The role being targeted, if mentioned." },
      },
      required: ["interviewType", "domain", "experienceLevel", "techStack", "targetRole"],
      additionalProperties: false,
    },
  },
};

function isValidProfileDraft(value: unknown): value is ProfileDraft {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;

  if (typeof v.interviewType !== "string") return false;
  if (!(INTERVIEW_TYPES as readonly string[]).includes(v.interviewType)) return false;

  const nullableFields = ["domain", "experienceLevel", "techStack", "targetRole"] as const;
  return nullableFields.every((key) => v[key] === null || typeof v[key] === "string");
}

function toChatMessages(history: OnboardingChatMessage[]): ChatCompletionMessageParam[] {
  return history.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.text,
  }));
}

async function callModel(
  client: OpenAI,
  messages: ChatCompletionMessageParam[]
): Promise<OpenAI.Chat.Completions.ChatCompletion.Choice["message"]> {
  const completion = await client.chat.completions.create({
    model: LLM_MODEL,
    messages,
    tools: [SUBMIT_PROFILE_TOOL],
    tool_choice: "auto",
    temperature: 0.4,
  });

  const message = completion.choices[0]?.message;
  if (!message) {
    throw new Error("The model returned an empty response.");
  }
  return message;
}

function extractProfileDraft(
  message: OpenAI.Chat.Completions.ChatCompletion.Choice["message"]
): ProfileDraft | null {
  const toolCall = message.tool_calls?.find(
    (call) => call.type === "function" && call.function.name === "submit_profile"
  );
  if (!toolCall || toolCall.type !== "function") return null;

  try {
    const parsed = JSON.parse(toolCall.function.arguments);
    if (!isValidProfileDraft(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function runOnboardingTurn(
  history: OnboardingChatMessage[],
  userMessage: string
): Promise<OnboardingTurnResult> {
  const client = getLLMClient();
  const baseMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: ONBOARDING_SYSTEM_PROMPT },
    ...toChatMessages(history),
    { role: "user", content: userMessage },
  ];

  let message = await callModel(client, baseMessages);

  if (message.tool_calls && message.tool_calls.length > 0) {
    const profileDraft = extractProfileDraft(message);
    if (profileDraft) {
      return {
        reply: message.content?.trim() || "Great, let's get your interview set up.",
        profileDraft,
      };
    }

    // The model tried to submit a profile but the arguments didn't validate - retry once
    // with a corrective nudge rather than surfacing a broken tool call to the user.
    message = await callModel(client, [
      ...baseMessages,
      {
        role: "system",
        content:
          "Your previous submit_profile call had invalid arguments. If you're ready to submit, call it again with valid arguments matching the schema exactly. Otherwise, just reply normally.",
      },
    ]);

    const retryDraft = extractProfileDraft(message);
    if (retryDraft) {
      return {
        reply: message.content?.trim() || "Great, let's get your interview set up.",
        profileDraft: retryDraft,
      };
    }
  }

  return {
    reply: message.content?.trim() || "Could you tell me a bit more about that?",
    profileDraft: null,
  };
}

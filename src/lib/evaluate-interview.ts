import OpenAI from "openai";
import type { InterviewFeedback, TranscriptLine } from "@/lib/interview-types";
import { getLLMClient, LLM_MODEL } from "@/lib/llm-client";

type EvaluationSessionMeta = {
  interviewType: string;
  difficulty: string;
  targetRole: string | null;
};

const PARAMETER_KEYS = [
  "technicalAccuracy",
  "communication",
  "clarity",
  "confidence",
  "structure",
] as const;

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

function isScore(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isExampleAnswerArray(value: unknown): value is InterviewFeedback["exampleAnswers"] {
  if (value === undefined) return true;
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as Record<string, unknown>).question === "string" &&
        typeof (item as Record<string, unknown>).modelAnswer === "string"
    )
  );
}

export function isValidFeedback(value: unknown): value is InterviewFeedback {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;

  if (!isScore(v.overallScore)) return false;

  if (!v.parameters || typeof v.parameters !== "object") return false;
  const parameters = v.parameters as Record<string, unknown>;
  if (!PARAMETER_KEYS.every((key) => isScore(parameters[key]))) return false;

  if (!isStringArray(v.strengths)) return false;
  if (!isStringArray(v.weaknesses)) return false;
  if (!isStringArray(v.suggestions)) return false;
  if (!isExampleAnswerArray(v.exampleAnswers)) return false;

  return true;
}

function parseFeedback(raw: string): InterviewFeedback {
  const cleaned = stripCodeFences(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("The model's response was not valid JSON.");
  }

  if (!isValidFeedback(parsed)) {
    throw new Error("The model's response JSON did not match the expected feedback shape.");
  }

  return parsed;
}

function buildEvaluationPrompt(
  transcript: TranscriptLine[],
  sessionMeta: EvaluationSessionMeta
): string {
  const transcriptText = transcript
    .map((line) => `${line.role === "assistant" ? "Interviewer" : "Candidate"}: ${line.text}`)
    .join("\n");

  return `You are an expert interview coach evaluating a completed mock interview.

Interview type: ${sessionMeta.interviewType}
Difficulty: ${sessionMeta.difficulty}
${sessionMeta.targetRole ? `Target role: ${sessionMeta.targetRole}` : ""}

Transcript:
${transcriptText}

Evaluate the candidate's performance based only on the transcript above. Respond with ONLY a single valid JSON object - no markdown, no code fences, no commentary before or after - matching exactly this shape:

{
  "overallScore": number (0-100),
  "parameters": {
    "technicalAccuracy": number (0-100),
    "communication": number (0-100),
    "clarity": number (0-100),
    "confidence": number (0-100),
    "structure": number (0-100)
  },
  "strengths": string[],
  "weaknesses": string[],
  "suggestions": string[],
  "exampleAnswers": [
    { "question": string, "modelAnswer": string }
  ]
}

For exampleAnswers, pick 2-3 of the most significant questions from the transcript and write a strong model answer for each - something the candidate could learn from.`;
}

async function callModel(client: OpenAI, prompt: string): Promise<string> {
  const completion = await client.chat.completions.create({
    model: LLM_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are an expert interview coach. You always respond with a single valid JSON object and nothing else.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("The model returned an empty response.");
  }
  return content;
}

export async function evaluateInterview(
  transcript: TranscriptLine[],
  sessionMeta: EvaluationSessionMeta
): Promise<InterviewFeedback> {
  if (transcript.length === 0) {
    throw new Error("Cannot evaluate an interview with an empty transcript.");
  }

  const client = getLLMClient();
  const prompt = buildEvaluationPrompt(transcript, sessionMeta);

  try {
    const raw = await callModel(client, prompt);
    return parseFeedback(raw);
  } catch (firstErr) {
    console.error("[evaluate-interview] first attempt failed, retrying once", firstErr);
    try {
      const raw = await callModel(client, prompt);
      return parseFeedback(raw);
    } catch (secondErr) {
      console.error("[evaluate-interview] second attempt failed", secondErr);
      throw new Error("Failed to generate interview feedback after two attempts. Please try again.");
    }
  }
}

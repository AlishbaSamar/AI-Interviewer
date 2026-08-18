import OpenAI from "openai";

export const LLM_MODEL = "openai/gpt-oss-120b";

export function getLLMClient(): OpenAI {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set.");
  }
  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

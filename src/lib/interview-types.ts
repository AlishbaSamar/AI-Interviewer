export type TranscriptLine = {
  role: "assistant" | "user";
  text: string;
};

export type InterviewFeedback = {
  overallScore: number;
  parameters: {
    technicalAccuracy: number;
    communication: number;
    clarity: number;
    confidence: number;
    structure: number;
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
};

export type TranscriptLine = {
  role: "assistant" | "user";
  text: string;
};

export type OnboardingProfile = {
  interviewType: string;
  domain: string | null;
  experienceLevel: string | null;
  techStack: string | null;
  targetRole: string | null;
  numQuestions: number;
  difficulty: string;
  mode: string;
};

export type InterviewFeedbackParameters = {
  technicalAccuracy: number;
  communication: number;
  clarity: number;
  confidence: number;
  structure: number;
};

export type ExampleAnswer = {
  question: string;
  modelAnswer: string;
};

export type InterviewFeedback = {
  overallScore: number;
  parameters: InterviewFeedbackParameters;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  exampleAnswers?: ExampleAnswer[];
};

export const PARAMETER_LABELS: { key: keyof InterviewFeedbackParameters; label: string }[] = [
  { key: "technicalAccuracy", label: "Technical Accuracy" },
  { key: "communication", label: "Communication" },
  { key: "clarity", label: "Clarity" },
  { key: "confidence", label: "Confidence" },
  { key: "structure", label: "Structure" },
];

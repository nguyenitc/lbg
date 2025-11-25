export type QuestionType = 'radio' | 'number' | 'select';

export interface Option {
  label: string;
  value: string;
}

export interface Question {
  id: number;
  text: string;
  subText?: string;
  type: QuestionType;
  options?: Option[]; // For radio/select
  suffix?: string; // e.g., "%", "Tỷ"
  placeholder?: string;
}

export interface AnswerState {
  [key: number]: string | number;
}

export enum RiskLevel {
  GO = 'GO',
  CAUTION = 'CAUTION',
  NO_GO_SOFT = 'NO_GO_SOFT',
  NO_GO_HARD = 'NO_GO_HARD',
}

export interface ScoringResult {
  score: number;
  maxScore: number;
  confidence: string;
  level: RiskLevel;
  message: string;
  action: string;
  emailTemplate?: {
    subject: string;
    body: string;
  };
}
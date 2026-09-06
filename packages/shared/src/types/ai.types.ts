import { SupportedLanguage } from '../constants/languages';

export type AIProviderName = 'groq' | 'gemini' | 'openrouter';

export type AIFeature = 'hints' | 'review' | 'classify';

export interface IHintRequest {
  submissionId: string;
}

export interface IHintResponse {
  hint: string;
  cached: boolean;
  provider: string;
  remainingDaily?: number;
  remainingHourly?: number;
}

export interface IProblemReviewFindingAmbiguity {
  issue: string;
  suggestion: string;
}

export interface IProblemReviewFindingEdgeCase {
  description: string;
  suggestedInput: string;
  expectedBehavior: string;
}

export interface IProblemReviewFindingAdversarial {
  input: string;
  rationale: string;
}

export interface IProblemReviewFindingInconsistency {
  between: string;
  issue: string;
}

export interface IProblemReviewResponse {
  statementAmbiguities: IProblemReviewFindingAmbiguity[];
  missingEdgeCases: IProblemReviewFindingEdgeCase[];
  adversarialInputs: IProblemReviewFindingAdversarial[];
  inconsistencies: IProblemReviewFindingInconsistency[];
  overallAssessment: string;
}

export interface IApproachClassification {
  approach: string;
  timeComplexity: string;
  spaceComplexity: string;
  relatedProblemCode?: string;
}

export interface IClassifyJobPayload {
  submissionId: string;
  problemId: string;
  code: string;
  language: SupportedLanguage;
  problemStatement: string;
  problemName: string;
}

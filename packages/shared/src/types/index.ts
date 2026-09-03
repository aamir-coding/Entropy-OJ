import { Verdict } from '../constants/verdicts';
import { SupportedLanguage } from '../constants/languages';
import { IApproachClassification } from './ai.types';

export * from './ai.types';

export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  role?: 'user' | 'admin';
  createdAt: string | Date;
}

export const ProblemDifficulties = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
} as const;

export const ALL_PROBLEM_DIFFICULTIES = [
  ProblemDifficulties.EASY,
  ProblemDifficulties.MEDIUM,
  ProblemDifficulties.HARD,
] as const;

export type ProblemDifficulty = (typeof ALL_PROBLEM_DIFFICULTIES)[number];


export interface ISampleTestCase {
  input: string;
  output: string;
  explanation?: string;
}

export interface IProblem {
  _id: string;
  problemCode: string;
  name: string;
  statement: string;
  difficulty: ProblemDifficulty;
  tags: string[];
  timeLimitMs: number;
  memoryLimitKb: number;
  sampleCases: ISampleTestCase[];
  totalSubmissions?: number;
  acceptedSubmissions?: number;
  createdAt: string | Date;
}

export interface IProblemListItem {
  _id: string;
  problemCode: string;
  name: string;
  difficulty: ProblemDifficulty;
  tags: string[];
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  userStatus?: 'Solved' | 'Attempted' | 'Unsolved';
}

export interface ITestCase {
  _id: string;
  problem: string;
  input: string;
  output: string;
  isSample: boolean;
  order: number;
}

export interface IAdminTestCaseInput {
  _id?: string;
  input: string;
  output: string;
  isSample: boolean;
  order?: number;
  explanation?: string;
}

export interface IAdminProblemDetail extends IProblem {
  testCases: ITestCase[];
}

export interface IAdminProblemListItem extends IProblemListItem {
  sampleCasesCount: number;
  hiddenCasesCount: number;
  totalCasesCount: number;
  createdAt: string | Date;
}

export interface IAdminValidateTestCaseResult {
  testCaseIndex: number;
  isSample: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  verdict: Verdict;
  executionTimeMs: number;
  memoryUsedKb: number;
  error?: string;
}

export interface IAdminValidateSolutionResponse {
  verdict: Verdict;
  compileOutput?: string;
  totalTestCases: number;
  passedTestCases: number;
  executionTimeMs: number;
  memoryUsedKb: number;
  results: IAdminValidateTestCaseResult[];
}

export interface ISolutionUserPopulated {
  _id: string;
  fullName: string;
  email: string;
}

export interface ISolutionProblemPopulated {
  _id: string;
  problemCode: string;
  name: string;
  difficulty: ProblemDifficulty;
}

export interface ISolution {
  _id: string;
  user: string | ISolutionUserPopulated;
  problem: string | ISolutionProblemPopulated;
  code: string;
  language: SupportedLanguage;
  verdict: Verdict;
  compileOutput?: string;
  executionTime?: number; // in milliseconds
  memoryUsed?: number; // in KB
  failedTestCaseNumber?: number; // 1-indexed test case number
  totalTestCases?: number;
  passedTestCases?: number;
  classification?: IApproachClassification;
  submittedAt: string | Date;
}

export interface ISolutionPopulated extends Omit<ISolution, 'user' | 'problem'> {
  user: ISolutionUserPopulated;
  problem: ISolutionProblemPopulated;
}

export interface ISubmissionResponse {
  submissionId: string;
  verdict: Verdict;
  /** @deprecated Use `verdict` instead. */
  status?: Verdict;
  problemId: string;
  problemCode: string;
  problemName: string;
  language: SupportedLanguage;
  compileOutput?: string;
  executionTime?: number;
  memoryUsed?: number;
  failedTestCaseNumber?: number;
  totalTestCases?: number;
  passedTestCases?: number;
  classification?: IApproachClassification;
  submittedAt: string | Date;
}

export interface ISubmissionHistoryItem {
  _id: string;
  problem: {
    _id: string;
    problemCode: string;
    name: string;
    difficulty: ProblemDifficulty;
  };
  language: SupportedLanguage;
  verdict: Verdict;
  executionTime?: number;
  memoryUsed?: number;
  passedTestCases?: number;
  totalTestCases?: number;
  classification?: IApproachClassification;
  submittedAt: string | Date;
  code?: string;
}

export interface JudgeJobPayload {
  submissionId: string;
  problemId: string;
  userId: string;
  code: string;
  language: SupportedLanguage;
  timeLimitMs: number;
  memoryLimitKb: number;
}

export interface TestCaseExecutionResult {
  testCaseNumber: number;
  isSample: boolean;
  passed: boolean;
  verdict: Verdict;
  timeMs: number;
  memoryKb: number;
  actualOutput?: string;
  expectedOutput?: string;
  errorMessage?: string;
}

export interface JudgeExecutionResult {
  submissionId: string;
  verdict: Verdict;
  compileOutput?: string;
  executionTime: number; // max execution time among all testcases in ms
  memoryUsed: number; // max memory used among all testcases in KB
  failedTestCaseNumber?: number;
  totalTestCases: number;
  passedTestCases: number;
}

// Sample run contracts for live sample execution endpoint
export interface ISampleCaseResult {
  caseIndex: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  verdict: Verdict;
  executionTimeMs: number;
  memoryUsedKb: number;
  error?: string;
}

export interface ISampleRunResponse {
  verdict: Verdict;
  compileOutput?: string;
  totalCases: number;
  passedCases: number;
  sampleResults: ISampleCaseResult[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface UserStats {
  totalSubmissions: number;
  acceptedSubmissions: number;
  solvedProblemsCount: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number;
}

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

export const ALL_PROBLEM_DIFFICULTIES = Object.freeze([
  ProblemDifficulties.EASY,
  ProblemDifficulties.MEDIUM,
  ProblemDifficulties.HARD,
]) as readonly ['Easy', 'Medium', 'Hard'];

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

/** Base interface uniting test case evaluation and validation outputs (Low 1) */
export interface IBaseTestCaseResult {
  passed: boolean;
  verdict: Verdict;
  actualOutput?: string;
  expectedOutput?: string;
  error?: string;
}

export interface IAdminValidateTestCaseResult extends IBaseTestCaseResult {
  testCaseIndex: number;
  isSample: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
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

/** Unpopulated storage entity directly reflecting Mongoose schema (Medium 5) */
export interface ISolutionRaw {
  _id: string;
  user: string;
  problem: string;
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

/** Strictly populated presentation contract for API responses (Medium 5) */
export interface ISolutionPopulated extends Omit<ISolutionRaw, 'user' | 'problem'> {
  user: ISolutionUserPopulated;
  problem: ISolutionProblemPopulated;
}

/** Flexible solution type supporting raw database or populated presentation */
export type ISolution = ISolutionRaw | ISolutionPopulated;

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

export interface TestCaseExecutionResult extends IBaseTestCaseResult {
  testCaseNumber: number;
  isSample: boolean;
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
export interface ISampleCaseResult extends IBaseTestCaseResult {
  caseIndex: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
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

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message?: string;
  data: T;
  error?: never;
  errors?: never;
}

export interface ApiErrorResponse {
  success: false;
  message?: string;
  data?: never;
  error: string;
  errors?: Record<string, string[]>;
}

/** Discriminated union between API success and error envelopes (Low 2) */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface UserStats {
  totalSubmissions: number;
  acceptedSubmissions: number;
  solvedProblemsCount: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number;
}

export interface IGalaxyProblem {
  id: string;
  code: string;
  title: string;
  difficulty: ProblemDifficulty;
  category: string;
  order: number;
}

export interface IGalaxyProgressResponse {
  availableCodes: string[];
  solvedCodes: string[];
  attemptedCodes: string[];
}


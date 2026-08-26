import { Verdict } from '../constants/verdicts';
import { SupportedLanguage } from '../constants/languages';

export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  createdAt: string | Date;
}

export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';

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

export interface ISolution {
  _id: string;
  user: string | { _id: string; fullName: string; email: string };
  problem: string | { _id: string; problemCode: string; name: string; difficulty: ProblemDifficulty };
  code: string;
  language: SupportedLanguage;
  verdict: Verdict;
  compileOutput?: string;
  executionTime?: number; // in milliseconds
  memoryUsed?: number; // in KB
  failedTestCaseNumber?: number; // 1-indexed test case number
  totalTestCases?: number;
  passedTestCases?: number;
  submittedAt: string | Date;
}

export interface ISubmissionResponse {
  submissionId: string;
  status: Verdict;
  problemId: string;
  problemCode: string;
  problemName: string;
  language: SupportedLanguage;
  verdict: Verdict;
  compileOutput?: string;
  executionTime?: number;
  memoryUsed?: number;
  failedTestCaseNumber?: number;
  totalTestCases?: number;
  passedTestCases?: number;
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

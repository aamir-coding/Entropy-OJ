export const Verdicts = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  WRONG_ANSWER: 'Wrong Answer',
  TIME_LIMIT_EXCEEDED: 'Time Limit Exceeded',
  MEMORY_LIMIT_EXCEEDED: 'Memory Limit Exceeded',
  RUNTIME_ERROR: 'Runtime Error',
  COMPILATION_ERROR: 'Compilation Error',
  INTERNAL_ERROR: 'Internal Error',
} as const;

export type Verdict = (typeof Verdicts)[keyof typeof Verdicts];

export const VerdictShortCodes: Record<Verdict, string> = {
  [Verdicts.PENDING]: 'PD',
  [Verdicts.ACCEPTED]: 'AC',
  [Verdicts.WRONG_ANSWER]: 'WA',
  [Verdicts.TIME_LIMIT_EXCEEDED]: 'TLE',
  [Verdicts.MEMORY_LIMIT_EXCEEDED]: 'MLE',
  [Verdicts.RUNTIME_ERROR]: 'RTE',
  [Verdicts.COMPILATION_ERROR]: 'CE',
  [Verdicts.INTERNAL_ERROR]: 'IE',
};

export const ALL_VERDICTS: Verdict[] = Object.values(Verdicts);

export interface SeedTestCase {
  input: string;
  output: string;
  isSample: boolean;
}

export interface SeedSampleCase {
  input: string;
  output: string;
  explanation?: string;
}

export interface SeedProblemData {
  problemCode: string;
  name: string;
  statement: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  timeLimitMs: number;
  memoryLimitKb: number;
  sampleCases: SeedSampleCase[];
  testCases: SeedTestCase[];
  editorial?: string;
}

export function rangeString(start: number, end: number): string {
  const arr: number[] = [];
  if (start <= end) {
    for (let i = start; i <= end; i++) arr.push(i);
  } else {
    for (let i = start; i >= end; i--) arr.push(i);
  }
  return arr.join(' ');
}

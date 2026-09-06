import { SupportedLanguage, SupportedLanguages, LANGUAGE_CONFIGS } from './languages';
import {
  ARRAYS_HASHING_SOLUTIONS,
  TWO_POINTERS_SOLUTIONS,
  SLIDING_WINDOW_SOLUTIONS,
  STACK_SOLUTIONS,
  BINARY_SEARCH_SOLUTIONS,
  LINKED_LIST_SOLUTIONS,
  TREES_SOLUTIONS,
  TRIES_SOLUTIONS,
  HEAP_SOLUTIONS,
  BACKTRACKING_SOLUTIONS,
  GRAPHS_SOLUTIONS,
  ADVANCED_GRAPHS_SOLUTIONS,
  ONE_D_DP_SOLUTIONS,
  TWO_D_DP_SOLUTIONS,
  GREEDY_SOLUTIONS,
  INTERVALS_SOLUTIONS,
  MATH_GEOMETRY_SOLUTIONS,
  BIT_MANIPULATION_SOLUTIONS,
  IProblemModelSolutions,
} from './solutions';

export * from './solutions';

const rawModelSolutions: Record<string, IProblemModelSolutions> = {
  ...ARRAYS_HASHING_SOLUTIONS,
  ...TWO_POINTERS_SOLUTIONS,
  ...SLIDING_WINDOW_SOLUTIONS,
  ...STACK_SOLUTIONS,
  ...BINARY_SEARCH_SOLUTIONS,
  ...LINKED_LIST_SOLUTIONS,
  ...TREES_SOLUTIONS,
  ...TRIES_SOLUTIONS,
  ...HEAP_SOLUTIONS,
  ...BACKTRACKING_SOLUTIONS,
  ...GRAPHS_SOLUTIONS,
  ...ADVANCED_GRAPHS_SOLUTIONS,
  ...ONE_D_DP_SOLUTIONS,
  ...TWO_D_DP_SOLUTIONS,
  ...GREEDY_SOLUTIONS,
  ...INTERVALS_SOLUTIONS,
  ...MATH_GEOMETRY_SOLUTIONS,
  ...BIT_MANIPULATION_SOLUTIONS,
};

export const MODEL_SOLUTIONS: Readonly<Record<string, Readonly<IProblemModelSolutions>>> = Object.freeze(
  Object.fromEntries(
    Object.entries(rawModelSolutions).map(([k, v]) => [k, Object.freeze(v)])
  )
);

/**
 * Retrieve reference model solution for a given problem code and language.
 * Falls back to the standard starter code if no model solution is registered.
 */
export function getModelSolution(
  problemCode: string | undefined | null,
  language: SupportedLanguage = SupportedLanguages.PYTHON
): string {
  if (problemCode) {
    const normalized = problemCode.toLowerCase().trim();
    const solutions = MODEL_SOLUTIONS[normalized];
    if (solutions && solutions[language]) {
      return solutions[language];
    }
  }

  // Graceful fallback to default starter code
  return LANGUAGE_CONFIGS[language]?.starterCode ?? '# No starter code available';
}

/**
 * Check if a problem has a registered reference model solution.
 */
export function hasModelSolution(
  problemCode: string | undefined | null,
  language?: SupportedLanguage
): boolean {
  if (!problemCode) return false;
  const normalized = problemCode.toLowerCase().trim();
  const solutions = MODEL_SOLUTIONS[normalized];
  if (!solutions) return false;
  if (language) {
    return Boolean(solutions[language]);
  }
  return Object.values(SupportedLanguages).some((lang) => Boolean(solutions[lang]));
}

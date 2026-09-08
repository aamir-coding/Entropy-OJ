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

const topicSolutionMaps: readonly Record<string, IProblemModelSolutions>[] = [
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
];

// O(1) index map for direct problem lookups without massive object spreading
const problemIndex = new Map<string, IProblemModelSolutions>();
for (const topicMap of topicSolutionMaps) {
  for (const key of Object.keys(topicMap)) {
    problemIndex.set(key, topicMap[key]);
  }
}

// On-demand freeze cache per problem solution
const solutionCache = new Map<string, Readonly<IProblemModelSolutions>>();

function getFrozenSolution(key: string): Readonly<IProblemModelSolutions> | undefined {
  let cached = solutionCache.get(key);
  if (!cached) {
    const raw = problemIndex.get(key);
    if (raw) {
      cached = Object.freeze({ ...raw });
      solutionCache.set(key, cached);
    }
  }
  return cached;
}

export function findProblemModelSolutions(problemCode: string | undefined | null): Readonly<IProblemModelSolutions> | undefined {
  if (!problemCode) return undefined;
  return getFrozenSolution(problemCode.toLowerCase().trim());
}

const solutionsContainer: Record<string, Readonly<IProblemModelSolutions>> = {};
for (const key of problemIndex.keys()) {
  Object.defineProperty(solutionsContainer, key, {
    get: () => getFrozenSolution(key),
    enumerable: true,
    configurable: false,
  });
}

export const MODEL_SOLUTIONS: Readonly<Record<string, Readonly<IProblemModelSolutions>>> = Object.freeze(solutionsContainer);

/**
 * Retrieve reference model solution for a given problem code and language.
 * Falls back to the standard starter code if no model solution is registered.
 */
export function getModelSolution(
  problemCode: string | undefined | null,
  language: SupportedLanguage = SupportedLanguages.PYTHON
): string {
  const solutions = findProblemModelSolutions(problemCode);
  if (solutions && solutions[language]) {
    return solutions[language];
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
  const solutions = findProblemModelSolutions(problemCode);
  if (!solutions) return false;
  if (language) {
    return Boolean(solutions[language]);
  }
  return Object.values(SupportedLanguages).some((lang) => Boolean(solutions[lang]));
}

import { SeedProblemData } from '../types';
import { ARRAYS_HASHING_PROBLEMS } from './01_arrays_hashing';
import { TWO_POINTERS_PROBLEMS } from './02_two_pointers';
import { SLIDING_WINDOW_PROBLEMS } from './03_sliding_window';
import { STACK_PROBLEMS } from './04_stack';
import { BINARY_SEARCH_PROBLEMS } from './05_binary_search';
import { LINKED_LIST_PROBLEMS } from './06_linked_list';
import { TREES_PROBLEMS } from './07_trees';
import { TRIES_PROBLEMS } from './08_tries';
import { HEAP_PROBLEMS } from './09_heap_priority_queue';
import { BACKTRACKING_PROBLEMS } from './10_backtracking';
import { GRAPHS_PROBLEMS } from './11_graphs';
import { ADVANCED_GRAPHS_PROBLEMS } from './12_advanced_graphs';
import { ONE_D_DP_PROBLEMS } from './13_1d_dp';
import { TWO_D_DP_PROBLEMS } from './14_2d_dp';
import { GREEDY_PROBLEMS } from './15_greedy';
import { INTERVALS_PROBLEMS } from './16_intervals';
import { MATH_GEOMETRY_PROBLEMS } from './17_math_geometry';
import { BIT_MANIPULATION_PROBLEMS } from './18_bit_manipulation';

export * from './01_arrays_hashing';
export * from './02_two_pointers';
export * from './03_sliding_window';
export * from './04_stack';
export * from './05_binary_search';
export * from './06_linked_list';
export * from './07_trees';
export * from './08_tries';
export * from './09_heap_priority_queue';
export * from './10_backtracking';
export * from './11_graphs';
export * from './12_advanced_graphs';
export * from './13_1d_dp';
export * from './14_2d_dp';
export * from './15_greedy';
export * from './16_intervals';
export * from './17_math_geometry';
export * from './18_bit_manipulation';

export const ALL_SEED_PROBLEMS: SeedProblemData[] = [
  ...ARRAYS_HASHING_PROBLEMS,
  ...TWO_POINTERS_PROBLEMS,
  ...SLIDING_WINDOW_PROBLEMS,
  ...STACK_PROBLEMS,
  ...BINARY_SEARCH_PROBLEMS,
  ...LINKED_LIST_PROBLEMS,
  ...TREES_PROBLEMS,
  ...TRIES_PROBLEMS,
  ...HEAP_PROBLEMS,
  ...BACKTRACKING_PROBLEMS,
  ...GRAPHS_PROBLEMS,
  ...ADVANCED_GRAPHS_PROBLEMS,
  ...ONE_D_DP_PROBLEMS,
  ...TWO_D_DP_PROBLEMS,
  ...GREEDY_PROBLEMS,
  ...INTERVALS_PROBLEMS,
  ...MATH_GEOMETRY_PROBLEMS,
  ...BIT_MANIPULATION_PROBLEMS,
];

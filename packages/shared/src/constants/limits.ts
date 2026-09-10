export const ExecutionLimits = {
  DEFAULT_TIME_LIMIT_MS: 1000,
  MAX_TIME_LIMIT_MS: 5000,
  DEFAULT_MEMORY_LIMIT_KB: 256 * 1024, // 256 MB
  MAX_MEMORY_LIMIT_KB: 512 * 1024, // 512 MB
  DEFAULT_COMPILE_TIME_LIMIT_MS: 10000, // 10 seconds
  WALL_CLOCK_KILL_FACTOR: 2.5, // Hard kill at 2.5x time limit
  MAX_CODE_SIZE_BYTES: 64 * 1024, // 64 KB
} as const;

/** @deprecated Import from `@entropy-oj/shared/queues` or `packages/shared/src/constants/queues` to avoid bundling backend queue topology in frontend bundles. */
export { QueueConfig, AIQueueConfig } from './queues';


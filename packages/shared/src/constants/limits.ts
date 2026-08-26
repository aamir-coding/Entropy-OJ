export const ExecutionLimits = {
  DEFAULT_TIME_LIMIT_MS: 1000,
  MAX_TIME_LIMIT_MS: 5000,
  DEFAULT_MEMORY_LIMIT_KB: 256 * 1024, // 256 MB
  MAX_MEMORY_LIMIT_KB: 512 * 1024, // 512 MB
  DEFAULT_COMPILE_TIME_LIMIT_MS: 10000, // 10 seconds
  WALL_CLOCK_KILL_FACTOR: 2.5, // Hard kill at 2.5x time limit
  MAX_CODE_SIZE_BYTES: 64 * 1024, // 64 KB
} as const;

export const QueueConfig = {
  SUBMISSION_QUEUE_NAME: 'submission-queue',
  DEFAULT_JOB_ATTEMPTS: 2,
  BACKOFF_DELAY_MS: 3000,
} as const;

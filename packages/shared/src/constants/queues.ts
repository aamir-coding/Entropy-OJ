/**
 * Internal backend BullMQ queue configuration.
 * Scoped to server and worker execution pipelines to prevent exposing queue topology to browser bundles.
 */

export const QueueConfig = {
  SUBMISSION_QUEUE_NAME: 'submission-queue',
  DEFAULT_JOB_ATTEMPTS: 2,
  BACKOFF_DELAY_MS: 3000,
} as const;

export const AIQueueConfig = {
  AI_QUEUE_NAME: 'ai-queue',
  HINT_JOB_PREFIX: 'hint',
  REVIEW_JOB_PREFIX: 'review',
  CLASSIFY_JOB_PREFIX: 'classify',
  DEFAULT_JOB_ATTEMPTS: 2,
  BACKOFF_DELAY_MS: 5000,
} as const;

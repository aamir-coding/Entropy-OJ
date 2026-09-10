import { Queue } from 'bullmq';
import { JudgeJobPayload, QueueConfig } from '@entropy-oj/shared';
import { redisConnectionOptions } from '../config/redis';

export const submissionQueue = new Queue<JudgeJobPayload>(QueueConfig.SUBMISSION_QUEUE_NAME, {
  connection: redisConnectionOptions,
  defaultJobOptions: {
    attempts: QueueConfig.DEFAULT_JOB_ATTEMPTS,
    backoff: {
      type: 'exponential',
      delay: QueueConfig.BACKOFF_DELAY_MS,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
});

export async function enqueueSubmission(payload: JudgeJobPayload): Promise<string> {
  const job = await submissionQueue.add(`sub-${payload.submissionId}`, payload, {
    jobId: payload.submissionId,
  });

  console.log(`[Queue] Submission enqueued: Job ID ${job.id} for Submission ${payload.submissionId}`);
  return job.id as string;
}

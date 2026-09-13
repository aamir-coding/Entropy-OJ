import { Queue, QueueEvents } from 'bullmq';
import {
  JudgeJobPayload,
  QueueConfig,
  ISampleRunResponse,
  IAdminValidateSolutionResponse,
} from '@entropy-oj/shared';
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

export const submissionQueueEvents = new QueueEvents(QueueConfig.SUBMISSION_QUEUE_NAME, {
  connection: redisConnectionOptions,
});

export async function enqueueSubmission(payload: JudgeJobPayload): Promise<string> {
  const job = await submissionQueue.add(`sub-${payload.submissionId}`, payload, {
    jobId: payload.submissionId,
  });

  console.log(`[Queue] Submission enqueued: Job ID ${job.id} for Submission ${payload.submissionId}`);
  return job.id as string;
}

export async function executeSampleRun(payload: JudgeJobPayload, timeoutMs = 25000): Promise<ISampleRunResponse> {
  const job = await submissionQueue.add(`sample-${Date.now()}-${payload.submissionId}`, payload, {
    attempts: 1,
    removeOnComplete: true,
    removeOnFail: true,
  });

  return (await job.waitUntilFinished(submissionQueueEvents, timeoutMs)) as ISampleRunResponse;
}

export async function executeAdminValidation(
  payload: JudgeJobPayload,
  timeoutMs = 45000
): Promise<IAdminValidateSolutionResponse> {
  const job = await submissionQueue.add(`admin-val-${Date.now()}-${payload.submissionId}`, payload, {
    attempts: 1,
    removeOnComplete: true,
    removeOnFail: true,
  });

  return (await job.waitUntilFinished(submissionQueueEvents, timeoutMs)) as IAdminValidateSolutionResponse;
}


import { Queue, QueueEvents } from 'bullmq';
import {
  JudgeJobPayload,
  QueueConfig,
  ISampleRunResponse,
  IAdminValidateSolutionResponse,
} from '@entropy-oj/shared';
import { redisConnectionOptions, redisClient } from '../config/redis';

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

submissionQueue.on('error', (err) => {
  console.error('[Queue] ⚠️ submissionQueue error:', err.message);
});

submissionQueueEvents.on('error', (err) => {
  console.error('[Queue] ⚠️ submissionQueueEvents error:', err.message);
});

export async function enqueueSubmission(payload: JudgeJobPayload): Promise<string> {
  const redisStatus = redisClient.status;
  console.log(`[Queue] Enqueuing submission ${payload.submissionId} (Redis: ${redisStatus})`);

  try {
    const job = await submissionQueue.add(`sub-${payload.submissionId}`, payload, {
      jobId: payload.submissionId,
    });

    console.log(`[Queue] Submission enqueued: Job ID ${job.id} for Submission ${payload.submissionId}`);
    return job.id as string;
  } catch (err: any) {
    console.error(`[Queue] Failed to enqueue submission ${payload.submissionId} (Redis: ${redisStatus}):`, err.message);
    throw err;
  }
}

export async function executeSampleRun(payload: JudgeJobPayload, timeoutMs = 25000): Promise<ISampleRunResponse> {
  const redisStatus = redisClient.status;
  console.log(`[Queue] Enqueuing sample run for Problem ${payload.problemId} (Redis: ${redisStatus})`);

  try {
    const job = await submissionQueue.add(`sample-${Date.now()}-${payload.submissionId}`, payload, {
      attempts: 1,
      removeOnComplete: true,
      removeOnFail: true,
    });

    return (await job.waitUntilFinished(submissionQueueEvents, timeoutMs)) as ISampleRunResponse;
  } catch (err: any) {
    console.error(`[Queue] Sample run failed for Problem ${payload.problemId} (Redis: ${redisStatus}):`, err.message);
    throw err;
  }
}

export async function executeAdminValidation(
  payload: JudgeJobPayload,
  timeoutMs = 45000
): Promise<IAdminValidateSolutionResponse> {
  const redisStatus = redisClient.status;
  console.log(`[Queue] Enqueuing admin validation for Problem ${payload.problemId} (Redis: ${redisStatus})`);

  try {
    const job = await submissionQueue.add(`admin-val-${Date.now()}-${payload.submissionId}`, payload, {
      attempts: 1,
      removeOnComplete: true,
      removeOnFail: true,
    });

    return (await job.waitUntilFinished(submissionQueueEvents, timeoutMs)) as IAdminValidateSolutionResponse;
  } catch (err: any) {
    console.error(`[Queue] Admin validation failed for Problem ${payload.problemId} (Redis: ${redisStatus}):`, err.message);
    throw err;
  }
}


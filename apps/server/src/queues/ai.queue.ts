import { Queue } from 'bullmq';
import { IClassifyJobPayload, AIQueueConfig } from '@anti-oj/shared';
import { redisConnectionOptions } from '../config/redis';

export const aiQueue = new Queue<IClassifyJobPayload>(AIQueueConfig.AI_QUEUE_NAME, {
  connection: redisConnectionOptions,
  defaultJobOptions: {
    attempts: AIQueueConfig.DEFAULT_JOB_ATTEMPTS,
    backoff: {
      type: 'exponential',
      delay: AIQueueConfig.BACKOFF_DELAY_MS,
    },
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 200 },
  },
});

export async function enqueueClassifyJob(payload: IClassifyJobPayload): Promise<string> {
  const job = await aiQueue.add(
    `${AIQueueConfig.CLASSIFY_JOB_PREFIX}-${payload.submissionId}`,
    payload,
    {
      jobId: `classify-${payload.submissionId}`,
      priority: 10, // Lower priority than critical judge queue
    }
  );

  console.log(`[AI Queue] Enqueued approach classification job: ${job.id}`);
  return job.id as string;
}

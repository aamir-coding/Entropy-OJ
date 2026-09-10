import { Worker, Job } from 'bullmq';
import { IClassifyJobPayload, AIQueueConfig } from '@entropy-oj/shared';
import { redisConnectionOptions } from '../config/redis';
import { classifyService } from './classify/classifyService';

export function createAIWorker(): Worker<IClassifyJobPayload> {
  const worker = new Worker<IClassifyJobPayload>(
    AIQueueConfig.AI_QUEUE_NAME,
    async (job: Job<IClassifyJobPayload>) => {
      console.log(`[AI Worker] 📥 Processing AI Job ${job.id} (${job.name})`);
      try {
        if (job.name.startsWith(AIQueueConfig.CLASSIFY_JOB_PREFIX)) {
          await classifyService.classifySubmission(job.data);
        }
      } catch (err: any) {
        console.error(`[AI Worker] Error processing AI job ${job.id}:`, err.message);
        throw err;
      }
    },
    {
      connection: redisConnectionOptions,
      concurrency: 1, // Concurrency 1 keeps inference within rate limits and prevents quota exhaustion
    }
  );

  worker.on('ready', () => {
    console.log('[AI Worker] 🚀 BullMQ AI Worker ready (Concurrency: 1)');
  });

  worker.on('failed', (job, err) => {
    console.warn(`[AI Worker] Job ${job?.id} failed attempt ${job?.attemptsMade}: ${err.message}`);
  });

  return worker;
}

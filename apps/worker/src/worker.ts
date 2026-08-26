import { connectDB, disconnectDB } from './config/db';
import { redisClient } from './config/redis';
import { createSubmissionWorker } from './queue/submissionWorker';

async function bootstrap() {
  console.log('===================================================');
  console.log('🛡️  Anti Online Judge — Sandbox Execution Worker');
  console.log('===================================================');

  await connectDB();
  const worker = createSubmissionWorker();

  const gracefulShutdown = async (signal: string) => {
    console.log(`\n[Worker] Received ${signal}. Shutting down gracefully...`);
    await worker.close();
    console.log('[Worker] BullMQ worker stopped.');
    await disconnectDB();
    console.log('[Worker] MongoDB disconnected.');
    redisClient.disconnect();
    console.log('[Worker] Redis disconnected.');
    process.exit(0);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('[Worker] Fatal error during worker startup:', err);
  process.exit(1);
});

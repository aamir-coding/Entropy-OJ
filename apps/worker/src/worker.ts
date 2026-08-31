import { connectDB, disconnectDB } from './config/db';
import { redisClient } from './config/redis';
import { createSubmissionWorker } from './queue/submissionWorker';

async function bootstrap() {
  console.log('===================================================');
  console.log('🛡️  Anti Online Judge — Sandbox Execution Worker');
  console.log('===================================================');

  // Verify Database connection
  await connectDB();

  // Verify Redis readiness
  try {
    const pong = await redisClient.ping();
    console.log(`[Worker] Redis readiness confirmed: PING -> ${pong}`);
  } catch (redisErr: any) {
    console.error('[Worker] Redis connection failed during startup:', redisErr.message);
    process.exit(1);
  }

  const worker = createSubmissionWorker();

  const gracefulShutdown = async (signal: string) => {
    console.log(`\n[Worker] Received ${signal}. Shutting down gracefully...`);
    try {
      await worker.close();
      console.log('[Worker] BullMQ worker stopped.');
    } catch (err: any) {
      console.error('[Worker] Error stopping BullMQ worker:', err.message);
    }

    try {
      await disconnectDB();
      console.log('[Worker] MongoDB disconnected.');
    } catch (err: any) {
      console.error('[Worker] Error disconnecting MongoDB:', err.message);
    }

    try {
      await redisClient.quit();
      console.log('[Worker] Redis disconnected.');
    } catch (err: any) {
      console.error('[Worker] Error disconnecting Redis:', err.message);
    }

    process.exit(0);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    console.error('[Worker] 💥 Unhandled Promise Rejection:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('[Worker] 💥 Uncaught Exception:', error);
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error('[Worker] Fatal error during worker startup:', err);
  process.exit(1);
});

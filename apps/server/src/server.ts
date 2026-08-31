import { createApp } from './app';
import { connectDB, disconnectDB } from './config/db';
import { env } from './config/env';
import { redisClient } from './config/redis';
import { submissionQueue } from './queues/submission.queue';

async function bootstrap() {
  await connectDB();

  // Verify Redis readiness
  try {
    const pong = await redisClient.ping();
    console.log(`[Server] Redis readiness confirmed: PING -> ${pong}`);
  } catch (redisErr: any) {
    console.error('[Server] Redis connection failed during startup:', redisErr.message);
    process.exit(1);
  }

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`===================================================`);
    console.log(`🚀 Anti Online Judge API Server running on port ${env.PORT}`);
    console.log(`📡 Environment: ${env.NODE_ENV}`);
    console.log(`🌐 Allowed Client URL: ${env.CLIENT_URL}`);
    console.log(`===================================================`);
  });

  const gracefulShutdown = async (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      try {
        await submissionQueue.close();
        console.log('[Queue] BullMQ submission queue closed.');
      } catch (err: any) {
        console.error('[Queue] Error closing BullMQ queue:', err.message);
      }

      try {
        await disconnectDB();
        console.log('[Database] MongoDB disconnected.');
      } catch (err: any) {
        console.error('[Database] Error disconnecting DB:', err.message);
      }

      try {
        await redisClient.quit();
        console.log('[Redis] Redis disconnected.');
      } catch (err: any) {
        console.error('[Redis] Error disconnecting Redis:', err.message);
      }

      process.exit(0);
    });
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    console.error('[Server] 💥 Unhandled Promise Rejection:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('[Server] 💥 Uncaught Exception:', error);
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});

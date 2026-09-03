import { createApp } from './app';
import { connectDB, disconnectDB } from './config/db';
import { env } from './config/env';
import { redisClient } from './config/redis';
import { submissionQueue } from './queues/submission.queue';
import { aiQueue } from './queues/ai.queue';
import { createAIWorker } from './ai/aiWorker';
import { killActiveContainers } from './sandbox/dockerRunner';

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

  // Start in-process AI BullMQ Worker (networked, concurrency 1)
  const aiWorker = createAIWorker();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`===================================================`);
    console.log(`🚀 Anti Online Judge API Server running on port ${env.PORT}`);
    console.log(`📡 Environment: ${env.NODE_ENV}`);
    console.log(`🌐 Allowed Client URL: ${env.CLIENT_URL}`);
    console.log(`===================================================`);
  });

  let isShuttingDown = false;
  const gracefulShutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);

    // Hard 30-second kill switch to prevent hanging shutdowns (Issue M-1)
    const forceExitTimer = setTimeout(() => {
      console.error('[Server] ⚠️ Hard shutdown timeout of 30s exceeded. Forcing exit.');
      process.exit(1);
    }, 30000);
    forceExitTimer.unref();

    try {
      await new Promise<void>((resolve) => {
        server.close((err) => {
          if (err) console.error('[Server] Error closing HTTP server:', err.message);
          else console.log('[Server] HTTP server closed.');
          resolve();
        });
      });
    } catch {}

    try {
      await killActiveContainers();
      console.log('[Server] Active sandbox containers cleaned.');
    } catch (err: any) {
      console.error('[Server] Error cleaning sandbox containers:', err.message);
    }

    try {
      await aiWorker.close();
      console.log('[AI Worker] BullMQ AI worker closed.');
    } catch (err: any) {
      console.error('[AI Worker] Error closing AI worker:', err.message);
    }

    try {
      await submissionQueue.close();
      console.log('[Queue] BullMQ submission queue closed.');
    } catch (err: any) {
      console.error('[Queue] Error closing BullMQ queue:', err.message);
    }

    try {
      await aiQueue.close();
      console.log('[Queue] BullMQ AI queue closed.');
    } catch (err: any) {
      console.error('[Queue] Error closing AI queue:', err.message);
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

    clearTimeout(forceExitTimer);
    process.exit(0);
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

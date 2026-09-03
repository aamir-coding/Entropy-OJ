import http from 'http';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './config/db';
import { redisClient } from './config/redis';
import { env } from './config/env';
import { createSubmissionWorker } from './queue/submissionWorker';
import {
  reapOrphanedContainers,
  killActiveContainers,
  sweepStaleWorkspaces,
} from './sandbox/dockerRunner';

async function bootstrap() {
  console.log('===================================================');
  console.log('🛡️  Anti Online Judge — Sandbox Execution Worker');
  console.log('===================================================');

  // Verify Database connection
  await connectDB();

  // Startup sweeping of stale workspace folders & exited containers
  await sweepStaleWorkspaces();
  await reapOrphanedContainers();

  // Periodic reaper interval (every 10 minutes)
  const reaperInterval = setInterval(async () => {
    await sweepStaleWorkspaces();
    await reapOrphanedContainers();
  }, 10 * 60 * 1000);
  reaperInterval.unref();

  // Verify Redis readiness
  try {
    const pong = await redisClient.ping();
    console.log(`[Worker] Redis readiness confirmed: PING -> ${pong}`);
  } catch (redisErr: any) {
    console.error('[Worker] Redis connection failed during startup:', redisErr.message);
    process.exit(1);
  }

  const worker = createSubmissionWorker();

  // Health probe HTTP server for container orchestrators (Issue M-3)
  const healthPort = env.WORKER_HEALTH_PORT;
  const healthServer = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/live') {
      const isDbConnected = mongoose.connection.readyState === 1;
      const isWorkerRunning = worker.isRunning();
      const isHealthy = isDbConnected && isWorkerRunning;

      res.writeHead(isHealthy ? 200 : 503, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          status: isHealthy ? 'healthy' : 'degraded',
          db: isDbConnected ? 'connected' : 'disconnected',
          worker: isWorkerRunning ? 'running' : 'stopped',
          uptime: process.uptime(),
        })
      );
      return;
    }
    res.writeHead(404);
    res.end();
  });

  healthServer.listen(healthPort, () => {
    console.log(`[Worker] 🩺 Health probe listening on port ${healthPort} (/health)`);
  });

  let isShuttingDown = false;
  const gracefulShutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`\n[Worker] Received ${signal}. Shutting down gracefully...`);

    // Hard 30-second kill switch to prevent hanging shutdowns (Issue C-3)
    const forceExitTimer = setTimeout(() => {
      console.error('[Worker] ⚠️ Shutdown timeout of 30s exceeded. Forcing exit.');
      process.exit(1);
    }, 30000);
    forceExitTimer.unref();

    clearInterval(reaperInterval);

    try {
      healthServer.close();
      console.log('[Worker] Health server closed.');
    } catch {}

    try {
      await worker.close();
      console.log('[Worker] BullMQ worker stopped.');
    } catch (err: any) {
      console.error('[Worker] Error stopping BullMQ worker:', err.message);
    }

    try {
      await killActiveContainers();
      await reapOrphanedContainers();
      console.log('[Worker] Active containers cleaned.');
    } catch (err: any) {
      console.error('[Worker] Error cleaning containers during shutdown:', err.message);
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

    clearTimeout(forceExitTimer);
    process.exit(0);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    console.error('[Worker] 💥 Unhandled Promise Rejection:', reason);
  });

  process.on('uncaughtException', async (error) => {
    console.error('[Worker] 💥 Uncaught Exception:', error);
    try {
      await killActiveContainers();
    } catch {}
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error('[Worker] Fatal error during worker startup:', err);
  process.exit(1);
});


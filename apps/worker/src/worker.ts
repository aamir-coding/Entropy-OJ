import http from 'http';
import mongoose from 'mongoose';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { Queue } from 'bullmq';
import { connectDB, disconnectDB } from './config/db';
import { redisClient, redisConnectionOptions } from './config/redis';
import { env } from './config/env';
import { createSubmissionWorker } from './queue/submissionWorker';
import { QueueConfig } from '@entropy-oj/shared';
import {
  reapOrphanedContainers,
  killActiveContainers,
  sweepStaleWorkspaces,
  startSemaphoreHealthMonitor,
} from './sandbox/dockerRunner';

const execFileAsync = promisify(execFile);

/**
 * Drain stalled/stuck jobs from the queue before the worker starts accepting new work.
 * This prevents inheriting deadlocked state from a previous worker crash — jobs stuck in 'active'
 * status from a dead worker would permanently occupy semaphore slots and never complete.
 */
async function drainStalledJobs(): Promise<void> {
  try {
    const queue = new Queue(QueueConfig.SUBMISSION_QUEUE_NAME, {
      connection: redisConnectionOptions,
    });

    const activeJobs = await queue.getActive();
    const stalledCount = activeJobs.length;

    if (stalledCount > 0) {
      console.warn(`[Worker] Found ${stalledCount} active jobs from previous session. Moving to failed...`);
      for (const job of activeJobs) {
        try {
          await job.moveToFailed(
            new Error('Worker restarted — job was stuck in active state from previous session.'),
            job.token || '0',
            false
          );
          console.log(`[Worker] Moved stalled job ${job.id} to failed.`);
        } catch (err: any) {
          console.warn(`[Worker] Could not move job ${job.id} to failed: ${err.message}. Attempting remove...`);
          try {
            await job.remove();
            console.log(`[Worker] Removed stalled job ${job.id}.`);
          } catch (removeErr: any) {
            console.warn(`[Worker] Could not remove job ${job.id}: ${removeErr.message}`);
          }
        }
      }
    }

    // Also clean any waiting jobs that may be duplicates from stall re-queuing
    const waitingJobs = await queue.getWaiting();
    if (waitingJobs.length > 0) {
      console.log(`[Worker] ${waitingJobs.length} waiting jobs in queue (will be processed normally).`);
    }

    await queue.close();
    console.log(`[Worker] Queue drain complete. Cleared ${stalledCount} stalled jobs.`);
  } catch (err: any) {
    console.warn('[Worker] Queue drain skipped (non-fatal):', err.message);
  }
}

async function bootstrap() {
  console.log('===================================================');
  console.log('🛡️  Entropy — Sandbox Execution Worker');
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

  // Drain stalled/stuck jobs from the queue before accepting new work.
  // This prevents inheriting deadlocked state from a previous worker crash.
  await drainStalledJobs();

  const worker = createSubmissionWorker();

  // Start semaphore health monitor (auto-resets leaked semaphore slots after 60s of inactivity)
  const semaphoreMonitor = startSemaphoreHealthMonitor(30000);

  // Health probe HTTP server for container orchestrators (Issue M-3)
  const healthPort = env.WORKER_HEALTH_PORT;

  // Docker availability status cache (Low 1: prevent child process spawn overhead on frequent probes)
  let lastDockerCheckTime = 0;
  let cachedDockerStatus = false;
  const DOCKER_STATUS_CACHE_TTL_MS = 20000; // 20s TTL

  async function checkDockerConnected(): Promise<boolean> {
    const now = Date.now();
    if (now - lastDockerCheckTime < DOCKER_STATUS_CACHE_TTL_MS) {
      return cachedDockerStatus;
    }
    try {
      await execFileAsync('docker', ['info', '--format', '{{.ServerVersion}}'], { timeout: 3000, windowsHide: true });
      cachedDockerStatus = true;
    } catch {
      cachedDockerStatus = false;
    }
    lastDockerCheckTime = now;
    return cachedDockerStatus;
  }

  const healthServer = http.createServer(async (req, res) => {
    if (req.url === '/health' || req.url === '/live') {
      const isDbConnected = mongoose.connection.readyState === 1;
      const isWorkerRunning = worker.isRunning();

      let isRedisConnected = false;
      try {
        const pong = await redisClient.ping();
        isRedisConnected = pong === 'PONG';
      } catch {}

      const isDockerConnected = await checkDockerConnected();

      const isHealthy =
        isDbConnected &&
        isWorkerRunning &&
        isRedisConnected &&
        (env.NODE_ENV === 'test' || isDockerConnected);

      res.writeHead(isHealthy ? 200 : 503, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          status: isHealthy ? 'healthy' : 'degraded',
          db: isDbConnected ? 'connected' : 'disconnected',
          redis: isRedisConnected ? 'connected' : 'disconnected',
          docker: isDockerConnected ? 'connected' : 'disconnected',
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
  const gracefulShutdown = async (signal: string, exitCode = 0) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`\n[Worker] Received ${signal}. Shutting down gracefully (exitCode: ${exitCode})...`);

    // Hard 30-second kill switch to prevent hanging shutdowns (Issue C-3)
    const forceExitTimer = setTimeout(() => {
      console.error('[Worker] ⚠️ Shutdown timeout of 30s exceeded. Forcing exit.');
      process.exit(exitCode || 1);
    }, 30000);
    forceExitTimer.unref();

    clearInterval(reaperInterval);
    clearInterval(semaphoreMonitor);

    try {
      healthServer.close();
      console.log('[Worker] Health server closed.');
    } catch {}

    try {
      await Promise.race([
        worker.close(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('worker.close timeout exceeded')), 10000)),
      ]);
      console.log('[Worker] BullMQ worker stopped cleanly.');
    } catch (err: any) {
      console.warn('[Worker] Worker close timed out or encountered error, force cleaning active containers:', err.message);
      await killActiveContainers();
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
    process.exit(exitCode);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT', 0));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM', 0));

  process.on('unhandledRejection', (reason) => {
    console.error('[Worker] 💥 Unhandled Promise Rejection:', reason);
    gracefulShutdown('unhandledRejection', 1);
  });

  process.on('uncaughtException', (error) => {
    console.error('[Worker] 💥 Uncaught Exception:', error);
    gracefulShutdown('uncaughtException', 1);
  });
}

bootstrap().catch((err) => {
  console.error('[Worker] Fatal error during worker startup:', err);
  process.exit(1);
});


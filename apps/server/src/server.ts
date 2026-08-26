import { createApp } from './app';
import { connectDB, disconnectDB } from './config/db';
import { env } from './config/env';
import { redisClient } from './config/redis';

async function bootstrap() {
  await connectDB();

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
      await disconnectDB();
      console.log('[Database] MongoDB disconnected.');
      redisClient.disconnect();
      console.log('[Redis] Redis disconnected.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});

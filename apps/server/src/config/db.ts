import mongoose from 'mongoose';
import { env } from './env';

let listenersAttached = false;

export async function connectDB(): Promise<typeof mongoose> {
  try {
    if (!listenersAttached) {
      listenersAttached = true;
      mongoose.connection.on('error', (err) => {
        console.error('[Database] MongoDB connection error:', err);
      });
      mongoose.connection.on('disconnected', () => {
        console.warn('[Database] MongoDB disconnected');
      });
      mongoose.connection.on('reconnected', () => {
        console.log('[Database] MongoDB reconnected');
      });
    }

    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: env.NODE_ENV === 'test' ? 1000 : 10000,
      maxPoolSize: env.NODE_ENV === 'test' ? 10 : 50,
      minPoolSize: env.NODE_ENV === 'test' ? 2 : 10,
      socketTimeoutMS: 45000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error);
    if (env.NODE_ENV === 'test') {
      throw error;
    }
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}

import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<typeof mongoose> {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: env.NODE_ENV === 'test' ? 1000 : 10000,
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

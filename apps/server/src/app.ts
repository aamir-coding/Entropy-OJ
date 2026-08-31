import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import apiRoutes from './routes';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware';

export function createApp(): Express {
  const app = express();

  // Security HTTP headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS configuration for SPA client
  app.use(
    cors({
      origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Body and cookie parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // Logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.isProduction ? 'combined' : 'dev'));
  }

  // Rate limiting on API endpoints
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later.' },
  });

  // Health check endpoint (accessible on both root /health and /api/health)
  const healthHandler = (_req: express.Request, res: express.Response) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'anti-oj-server',
    });
  };

  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  // Mount API routes with global API limiter
  app.use('/api', apiLimiter, apiRoutes);

  // 404 & Error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

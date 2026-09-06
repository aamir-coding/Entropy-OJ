import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Resource not found: ${req.method} ${req.path}`,
  });
}

export function errorHandler(
  err: Error & { statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;

  if (env.isProduction) {
    console.error(`[Error Middleware] Status ${statusCode}: ${err.message}\n${err.stack}`);
  } else {
    console.error('[Error Middleware]:', err);
  }

  // In production, mask >= 500 internal errors to prevent information disclosure
  const message =
    env.isProduction && statusCode >= 500
      ? 'Internal Server Error'
      : (err.message || 'Internal Server Error');

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(!env.isProduction && { stack: err.stack }),
  });
}


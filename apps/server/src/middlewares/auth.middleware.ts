import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { redisClient } from '../config/redis';
import { User, IUserDocument } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUserDocument;
  userId?: string;
}

interface JwtPayload {
  userId: string;
  email: string;
  jti?: string;
  exp?: number;
}

function extractToken(req: AuthRequest): string | undefined {
  // Low 1: Prioritize explicit Authorization: Bearer header over implicit cookies
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match && match[1].trim()) {
      return match[1].trim();
    }
  }
  if (req.cookies?.token) {
    return req.cookies.token;
  }
  return undefined;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in.',
      });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    if (decoded.jti) {
      try {
        const isBlacklisted = await redisClient.get(`blacklist:jti:${decoded.jti}`);
        if (isBlacklisted) {
          res.status(401).json({
            success: false,
            error: 'Session has been revoked. Please log in again.',
          });
          return;
        }
      } catch (redisErr) {
        // Fallback: log warning but do not prevent authentication if Redis is transiently unreachable
        console.warn('[Auth] Redis token blacklist check encountered error:', redisErr);
      }
    }

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found. Session expired.',
      });
      return;
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired session token.',
    });
  }
}

/**
 * RBAC middleware: ensures the authenticated user has the 'admin' role.
 */
export async function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  await requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Access denied. Administrator privileges required.',
      });
      return;
    }
    next();
  });
}

/**
 * Optional auth middleware to identify authenticated users on public endpoints
 * without blocking unauthenticated visitors.
 */
export async function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);
    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = user;
        req.userId = user._id.toString();
      }
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
}

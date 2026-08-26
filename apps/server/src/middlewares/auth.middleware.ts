import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, IUserDocument } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUserDocument;
  userId?: string;
}

interface JwtPayload {
  userId: string;
  email: string;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in.',
      });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
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
 * Optional auth middleware to identify authenticated users on public endpoints
 * without blocking unauthenticated visitors.
 */
export async function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
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

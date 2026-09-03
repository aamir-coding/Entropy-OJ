import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';
import { Solution } from '../models/Solution';
import { AuthRequest } from '../middlewares/auth.middleware';
import { RegisterInput, LoginInput, Verdicts } from '@anti-oj/shared';

function generateToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, env.JWT_SECRET, {
    expiresIn: `${env.JWT_EXPIRES_DAYS}d`,
  });
}

function setTokenCookie(res: Response, token: string): void {
  const maxAge = env.JWT_EXPIRES_DAYS * 24 * 60 * 60 * 1000;
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'strict' : 'lax',
    maxAge,
  });
}

export async function register(
  req: Request<unknown, unknown, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { fullName, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
      return;
    }

    const newUser = await User.create({
      fullName,
      email: normalizedEmail,
      password,
    });

    const token = generateToken(newUser._id.toString(), newUser.email);
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          _id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request<unknown, unknown, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
      return;
    }

    const token = generateToken(user._id.toString(), user.email);
    setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('token', {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'strict' : 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}

export async function getMe(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    // Consolidated parallel aggregation to compute user stats directly in MongoDB (Issue M-5)
    const [totalSubmissions, totalAccepted, statsAggregation] = await Promise.all([
      Solution.countDocuments({ user: user._id }),
      Solution.countDocuments({
        user: user._id,
        verdict: Verdicts.ACCEPTED,
      }),
      Solution.aggregate([
        {
          $match: {
            user: user._id,
            verdict: Verdicts.ACCEPTED,
          },
        },
        {
          $lookup: {
            from: 'problems',
            localField: 'problem',
            foreignField: '_id',
            as: 'problemDoc',
          },
        },
        { $unwind: '$problemDoc' },
        {
          $group: {
            _id: '$problemDoc._id',
            difficulty: { $first: '$problemDoc.difficulty' },
          },
        },
        {
          $group: {
            _id: null,
            solvedCount: { $sum: 1 },
            easySolved: {
              $sum: { $cond: [{ $eq: ['$difficulty', 'Easy'] }, 1, 0] },
            },
            mediumSolved: {
              $sum: { $cond: [{ $eq: ['$difficulty', 'Medium'] }, 1, 0] },
            },
            hardSolved: {
              $sum: { $cond: [{ $eq: ['$difficulty', 'Hard'] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const aggResult = statsAggregation[0] || {
      solvedCount: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
    };

    const acceptanceRate =
      totalSubmissions > 0
        ? Math.round((totalAccepted / totalSubmissions) * 100 * 10) / 10
        : 0;

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        stats: {
          totalSubmissions,
          acceptedSubmissions: totalAccepted,
          solvedProblemsCount: aggResult.solvedCount,
          easySolved: aggResult.easySolved,
          mediumSolved: aggResult.mediumSolved,
          hardSolved: aggResult.hardSolved,
          acceptanceRate,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

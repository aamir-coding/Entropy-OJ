import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';
import { Solution } from '../models/Solution';
import { Problem } from '../models/Problem';
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

    // Compute user stats
    const totalSubmissions = await Solution.countDocuments({ user: user._id });
    const acceptedSolutions = await Solution.find({
      user: user._id,
      verdict: Verdicts.ACCEPTED,
    }).populate<{ problem: { _id: string; difficulty: 'Easy' | 'Medium' | 'Hard' } }>('problem', 'difficulty');

    const solvedProblemIds = new Set<string>();
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;

    for (const sol of acceptedSolutions) {
      if (sol.problem && !solvedProblemIds.has(sol.problem._id.toString())) {
        solvedProblemIds.add(sol.problem._id.toString());
        if (sol.problem.difficulty === 'Easy') easySolved++;
        else if (sol.problem.difficulty === 'Medium') mediumSolved++;
        else if (sol.problem.difficulty === 'Hard') hardSolved++;
      }
    }

    const totalAccepted = acceptedSolutions.length;
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
          createdAt: user.createdAt,
        },
        stats: {
          totalSubmissions,
          acceptedSubmissions: totalAccepted,
          solvedProblemsCount: solvedProblemIds.size,
          easySolved,
          mediumSolved,
          hardSolved,
          acceptanceRate,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

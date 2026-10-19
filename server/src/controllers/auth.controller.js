import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { registerSchema, loginSchema } from '../../../shared/schemas/research.schema.js';
import { logger } from '../utils/logger.js';

const COOKIE_NAME = 'token';

const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SECURE ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

export const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const passwordHash = await User.hashPassword(validatedData.password);
    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      passwordHash,
    });

    const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    setAuthCookie(res, token);
    logger.info(`New user registered: ${user.email} (${user._id})`);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token, // Also return for testing or mobile clients if needed
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await user.comparePassword(validatedData.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    setAuthCookie(res, token);
    logger.info(`User logged in: ${user.email} (${user._id})`);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SECURE ? 'none' : 'lax',
    path: '/',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    },
  });
};

import bcrypt from 'bcryptjs';
import prisma from '../db/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { generateToken, setTokenCookie, clearTokenCookie } from '../utils/generateToken.js';

const SALT_ROUNDS = 12;

export const authService = {
  async register({ fullName, email, password }) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { fullName, email, passwordHash },
      select: {
        id: true,
        fullName: true,
        email: true,
        preferredCurrency: true,
        timezone: true,
        createdAt: true,
      },
    });

    return user;
  },

  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        preferredCurrency: user.preferredCurrency,
        timezone: user.timezone,
        createdAt: user.createdAt,
      },
    };
  },

  async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        preferredCurrency: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  },

  async updateProfile(userId, data) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        fullName: true,
        email: true,
        preferredCurrency: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  },
};

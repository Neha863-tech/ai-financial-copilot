import prisma from '../db/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export const userService = {
  async getUserById(userId) {
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

  async updateUser(userId, data) {
    return prisma.user.update({
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
  },
};

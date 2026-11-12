import prisma from '../db/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export const categoryService = {
  async list(userId) {
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { userId },
          { userId: null, isSystem: true },
        ],
      },
      orderBy: { name: 'asc' },
    });
    return categories;
  },

  async create(userId, { name, direction = 'BOTH' }) {
    // Check for existing user or system category with same name
    const existing = await prisma.category.findFirst({
      where: {
        name,
        OR: [{ userId }, { userId: null, isSystem: true }],
      },
    });

    if (existing) {
      throw ApiError.conflict('A category with this name already exists');
    }

    const category = await prisma.category.create({
      data: { userId, name, direction, isSystem: false },
    });

    return category;
  },

  async update(userId, id, { name, direction }) {
    const category = await prisma.category.findFirst({
      where: { id, userId, isSystem: false },
    });

    if (!category) {
      throw ApiError.notFound('Category not found or cannot be modified');
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (direction) updateData.direction = direction;

    return prisma.category.update({
      where: { id },
      data: updateData,
    });
  },

  async delete(userId, id) {
    const category = await prisma.category.findFirst({
      where: { id, userId, isSystem: false },
    });

    if (!category) {
      throw ApiError.notFound('Category not found or cannot be deleted');
    }

    // Set transactions using this category to null
    await prisma.transaction.updateMany({
      where: { categoryId: id, userId },
      data: { categoryId: null },
    });

    await prisma.category.delete({ where: { id } });

    return { message: 'Category deleted successfully' };
  },
};

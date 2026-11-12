import prisma from '../db/prisma.js';
import { categoryRules } from './categoryRules.js';

export const categorizationService = {
  async categorize({ merchant, description, direction, userId }) {
    // Step 1: Try deterministic rule-based categorization
    const ruleResult = categoryRules.match(merchant, description, direction);
    
    if (ruleResult) {
      const category = await this.findCategoryByName(ruleResult.category, userId);
      if (category) {
        return {
          categoryId: category.id,
          method: 'RULE',
          confidence: ruleResult.confidence,
        };
      }
    }

    // Step 2: Could use AI categorization here - for now, mark as needs review
    return {
      categoryId: null,
      method: 'NONE',
      confidence: null,
    };
  },

  async findCategoryByName(name, userId) {
    // First try user's custom categories, then system categories
    const category = await prisma.category.findFirst({
      where: {
        name,
        OR: [
          { userId },
          { userId: null, isSystem: true },
        ],
      },
    });
    return category;
  },
};

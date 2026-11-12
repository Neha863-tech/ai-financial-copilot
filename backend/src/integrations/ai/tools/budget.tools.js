import { budgetService } from '../../../services/budget.service.js';

export const budgetTools = [
  {
    name: 'get_budget_status',
    description: 'Get budget status including limit, spent amount, remaining amount, utilization percentage, and status (ON_TRACK/WARNING/EXCEEDED) for a specific period and optional category.',
    parameters: {
      type: 'OBJECT',
      properties: {
        period: { type: 'STRING', description: 'Date within the budget period (e.g., 2026-11-15)' },
        categoryId: { type: 'STRING', description: 'Optional category UUID to check a specific category budget' },
        currency: { type: 'STRING', description: 'Currency code' },
      },
    },
    async execute({ userId, period, categoryId, currency }) {
      return budgetService.getBudgetStatus(userId, { period, categoryId, currency });
    },
  },
];


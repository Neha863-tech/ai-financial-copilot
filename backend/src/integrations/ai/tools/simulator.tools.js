import { savingsSimulatorService } from '../../../services/savingsSimulator.service.js';

export const simulatorTools = [
  {
    name: 'simulate_savings',
    description: 'Simulate potential savings by reducing spending in a specific category by a percentage. Returns estimated monthly and yearly savings based on historical data.',
    parameters: {
      type: 'OBJECT',
      properties: {
        categoryId: { type: 'STRING', description: 'Category UUID to simulate reduction for' },
        reductionPercentage: { type: 'NUMBER', description: 'Percentage to reduce (0-100)' },
        months: { type: 'NUMBER', description: 'Number of months to project (default 12)' },
        startDate: { type: 'STRING', description: 'Historical period start date' },
        endDate: { type: 'STRING', description: 'Historical period end date' },
      },
      required: ['reductionPercentage'],
    },
    async execute({ userId, categoryId, reductionPercentage, months, startDate, endDate }) {
      return savingsSimulatorService.simulate(userId, {
        categoryId,
        reductionPercentage,
        months,
        startDate,
        endDate,
      });
    },
  },
];


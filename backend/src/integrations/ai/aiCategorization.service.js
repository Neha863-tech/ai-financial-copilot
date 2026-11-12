import { createAIProvider } from './providerFactory.js';
import { CATEGORIZATION_SYSTEM_PROMPT } from './prompts/categorization.prompt.js';
import { aiConfig } from '../../config/ai.js';
import { logger } from '../../utils/logger.js';

const VALID_EXPENSE_CATEGORIES = [
  'Food & Dining', 'Groceries', 'Shopping', 'Transport', 'Utilities',
  'Housing', 'Healthcare', 'Education', 'Entertainment', 'Subscriptions',
  'Travel', 'Personal Care', 'Fees & Charges', 'Other', 'Needs Review',
];

const VALID_INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Business', 'Refund', 'Gift', 'Interest', 'Other Income',
];

export const aiCategorizationService = {
  async categorize({ description, merchant, amount, currency, direction }) {
    try {
      const provider = createAIProvider();

      const response = await provider.generateResponse({
        messages: [
          { role: 'system', content: CATEGORIZATION_SYSTEM_PROMPT },
          {
            role: 'user',
            content: JSON.stringify({
              description: description || '',
              merchant: merchant || '',
              amount: String(amount),
              currency: currency || 'INR',
              direction,
            }),
          },
        ],
        tools: [],
        model: aiConfig.model,
        temperature: 0.1,
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { category: 'Needs Review', confidence: 0, reason: 'Could not parse AI response' };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const validCategories = direction === 'INCOME' ? VALID_INCOME_CATEGORIES : VALID_EXPENSE_CATEGORIES;

      if (!validCategories.includes(parsed.category)) {
        return { category: 'Needs Review', confidence: 0, reason: 'AI returned invalid category' };
      }

      let confidence = parseFloat(parsed.confidence) || 0;
      confidence = Math.max(0, Math.min(1, confidence));

      if (confidence < 0.70) {
        return {
          category: direction === 'INCOME' ? 'Other Income' : 'Needs Review',
          confidence,
          reason: parsed.reason || 'Low confidence categorization',
        };
      }

      return {
        category: parsed.category,
        confidence,
        reason: parsed.reason || '',
      };
    } catch (error) {
      logger.error('AI categorization failed', { error: error.message });
      return { category: 'Needs Review', confidence: 0, reason: 'AI categorization unavailable' };
    }
  },
};


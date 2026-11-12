const MERCHANT_RULES = [
  // Food & Dining
  { patterns: ['swiggy', 'zomato', 'dominos', 'pizza hut', 'mcdonald', 'kfc', 'burger king', 'subway', 'starbucks', 'cafe coffee day', 'dunkin'], category: 'Food & Dining', direction: 'EXPENSE' },
  // Groceries
  { patterns: ['bigbasket', 'grofers', 'blinkit', 'dmart', 'reliance fresh', 'more supermarket', 'nature basket'], category: 'Groceries', direction: 'EXPENSE' },
  // Transport
  { patterns: ['uber', 'ola', 'rapido', 'metro', 'irctc', 'railways', 'petrol', 'fuel', 'parking', 'toll'], category: 'Transport', direction: 'EXPENSE' },
  // Shopping
  { patterns: ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'nykaa', 'tatacliq'], category: 'Shopping', direction: 'EXPENSE' },
  // Subscriptions / Entertainment
  { patterns: ['netflix', 'spotify', 'hotstar', 'prime video', 'youtube premium', 'apple music', 'disney'], category: 'Subscriptions', direction: 'EXPENSE' },
  // Entertainment
  { patterns: ['bookmyshow', 'pvr', 'inox', 'cinema', 'gaming'], category: 'Entertainment', direction: 'EXPENSE' },
  // Utilities
  { patterns: ['electricity', 'water bill', 'gas bill', 'broadband', 'jio', 'airtel', 'vodafone', 'bsnl', 'internet'], category: 'Utilities', direction: 'EXPENSE' },
  // Housing
  { patterns: ['rent', 'housing', 'maintenance', 'society', 'property tax'], category: 'Housing', direction: 'EXPENSE' },
  // Healthcare
  { patterns: ['hospital', 'pharmacy', 'medical', 'doctor', 'clinic', 'apollo', 'medplus', 'netmeds', 'practo'], category: 'Healthcare', direction: 'EXPENSE' },
  // Education
  { patterns: ['school', 'college', 'university', 'tuition', 'coursera', 'udemy', 'books', 'stationery'], category: 'Education', direction: 'EXPENSE' },
  // Travel
  { patterns: ['makemytrip', 'goibibo', 'booking.com', 'airbnb', 'hotel', 'flight', 'travel'], category: 'Travel', direction: 'EXPENSE' },
  // Personal Care
  { patterns: ['salon', 'spa', 'gym', 'fitness', 'haircut', 'beauty'], category: 'Personal Care', direction: 'EXPENSE' },
  // Fees & Charges
  { patterns: ['bank fee', 'atm charge', 'service charge', 'late fee', 'penalty', 'commission'], category: 'Fees & Charges', direction: 'EXPENSE' },
  // Income categories
  { patterns: ['salary', 'payroll', 'wages'], category: 'Salary', direction: 'INCOME' },
  { patterns: ['freelance', 'consulting', 'contract', 'gig'], category: 'Freelance', direction: 'INCOME' },
  { patterns: ['business', 'revenue', 'sales'], category: 'Business', direction: 'INCOME' },
  { patterns: ['refund', 'cashback', 'return'], category: 'Refund', direction: 'INCOME' },
  { patterns: ['gift', 'bonus', 'reward'], category: 'Gift', direction: 'INCOME' },
  { patterns: ['interest', 'dividend', 'investment return'], category: 'Interest', direction: 'INCOME' },
];

export const categoryRules = {
  match(merchant, description, direction) {
    const searchText = `${merchant || ''} ${description || ''}`.toLowerCase();
    
    for (const rule of MERCHANT_RULES) {
      // Direction must match if specified
      if (rule.direction && rule.direction !== direction) continue;
      
      for (const pattern of rule.patterns) {
        if (searchText.includes(pattern.toLowerCase())) {
          return {
            category: rule.category,
            confidence: 0.95,
            reason: `Matched merchant/description rule: "${pattern}"`,
          };
        }
      }
    }
    
    return null;
  },
};

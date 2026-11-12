import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Shopping',
  'Transport',
  'Utilities',
  'Housing',
  'Healthcare',
  'Education',
  'Entertainment',
  'Subscriptions',
  'Travel',
  'Personal Care',
  'Fees & Charges',
  'Other',
  'Needs Review',
];

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Refund',
  'Gift',
  'Interest',
  'Other Income',
];

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed System Categories
  console.log('Seeding system categories...');
  const categoryMap = {};

  for (const name of EXPENSE_CATEGORIES) {
    let category = await prisma.category.findFirst({
      where: { userId: null, name },
    });
    if (!category) {
      category = await prisma.category.create({
        data: {
          name,
          direction: 'EXPENSE',
          isSystem: true,
        },
      });
    }
    categoryMap[name] = category.id;
  }

  for (const name of INCOME_CATEGORIES) {
    let category = await prisma.category.findFirst({
      where: { userId: null, name },
    });
    if (!category) {
      category = await prisma.category.create({
        data: {
          name,
          direction: 'INCOME',
          isSystem: true,
        },
      });
    }
    categoryMap[name] = category.id;
  }

  console.log(`✓ Seeded ${Object.keys(categoryMap).length} system categories`);

  // 2. Seed Demo User
  console.log('Seeding demo user...');
  const demoEmail = 'demo@example.com';
  const passwordHash = await bcrypt.hash('DemoPassword123!', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: { passwordHash },
    create: {
      fullName: 'Demo Financial User',
      email: demoEmail,
      passwordHash,
      preferredCurrency: 'INR',
      timezone: 'Asia/Kolkata',
    },
  });

  console.log(`✓ Seeded demo user: ${demoEmail} (Password: DemoPassword123!)`);

  // 3. Clear existing demo transactions to keep seed idempotent
  await prisma.transaction.deleteMany({
    where: { userId: demoUser.id, source: 'DEMO' },
  });

  // 4. Seed Demo Transactions (Current and Previous month)
  console.log('Seeding demo transactions...');
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth(); // 0-indexed

  const demoTransactions = [
    // Current month income
    {
      userId: demoUser.id,
      source: 'DEMO',
      merchant: 'Tech Innovations Pvt Ltd',
      description: 'Monthly Salary Credit [DEMO]',
      amount: 75000.00,
      currency: 'INR',
      direction: 'INCOME',
      status: 'COMPLETED',
      transactionDate: new Date(Date.UTC(currentYear, currentMonth, 1, 9, 0, 0)),
      categoryId: categoryMap['Salary'],
      categorizationMethod: 'RULE',
    },
    {
      userId: demoUser.id,
      source: 'DEMO',
      merchant: 'Upwork Global',
      description: 'Freelance Design Project [DEMO]',
      amount: 15000.00,
      currency: 'INR',
      direction: 'INCOME',
      status: 'COMPLETED',
      transactionDate: new Date(Date.UTC(currentYear, currentMonth, 10, 14, 0, 0)),
      categoryId: categoryMap['Freelance'],
      categorizationMethod: 'RULE',
    },

    // Current month expenses
    {
      userId: demoUser.id,
      source: 'DEMO',
      merchant: 'Landlord Property',
      description: 'Apartment Monthly Rent [DEMO]',
      amount: 22000.00,
      currency: 'INR',
      direction: 'EXPENSE',
      status: 'COMPLETED',
      transactionDate: new Date(Date.UTC(currentYear, currentMonth, 2, 10, 0, 0)),
      categoryId: categoryMap['Housing'],
      categorizationMethod: 'RULE',
    },
    {
      userId: demoUser.id,
      source: 'DEMO',
      merchant: 'BigBasket',
      description: 'Monthly Grocery Essentials [DEMO]',
      amount: 4800.00,
      currency: 'INR',
      direction: 'EXPENSE',
      status: 'COMPLETED',
      transactionDate: new Date(Date.UTC(currentYear, currentMonth, 3, 16, 30, 0)),
      categoryId: categoryMap['Groceries'],
      categorizationMethod: 'RULE',
    },
    {
      userId: demoUser.id,
      source: 'DEMO',
      merchant: 'Swiggy',
      description: 'Weekend Family Dinner [DEMO]',
      amount: 1250.00,
      currency: 'INR',
      direction: 'EXPENSE',
      status: 'COMPLETED',
      transactionDate: new Date(Date.UTC(currentYear, currentMonth, 5, 20, 15, 0)),
      categoryId: categoryMap['Food & Dining'],
      categorizationMethod: 'RULE',
    },
    {
      userId: demoUser.id,
      source: 'DEMO',
      merchant: 'Uber',
      description: 'Office Commute Rides [DEMO]',
      amount: 850.00,
      currency: 'INR',
      direction: 'EXPENSE',
      status: 'COMPLETED',
      transactionDate: new Date(Date.UTC(currentYear, currentMonth, 7, 9, 30, 0)),
      categoryId: categoryMap['Transport'],
      categorizationMethod: 'RULE',
    },
    {
      userId: demoUser.id,
      source: 'DEMO',
      merchant: 'Netflix',
      description: 'Monthly Premium Subscription [DEMO]',
      amount: 649.00,
      currency: 'INR',
      direction: 'EXPENSE',
      status: 'COMPLETED',
      transactionDate: new Date(Date.UTC(currentYear, currentMonth, 8, 12, 0, 0)),
      categoryId: categoryMap['Subscriptions'],
      categorizationMethod: 'RULE',
    },
    {
      userId: demoUser.id,
      source: 'DEMO',
      merchant: 'Amazon',
      description: 'Ergonomic Desk Accessories [DEMO]',
      amount: 3499.00,
      currency: 'INR',
      direction: 'EXPENSE',
      status: 'COMPLETED',
      transactionDate: new Date(Date.UTC(currentYear, currentMonth, 12, 11, 45, 0)),
      categoryId: categoryMap['Shopping'],
      categorizationMethod: 'RULE',
    },

    // Previous month expenses for comparison & insights
    {
      userId: demoUser.id,
      source: 'DEMO',
      merchant: 'Tech Innovations Pvt Ltd',
      description: 'Previous Month Salary [DEMO]',
      amount: 75000.00,
      currency: 'INR',
      direction: 'INCOME',
      status: 'COMPLETED',
      transactionDate: new Date(Date.UTC(currentYear, currentMonth - 1, 1, 9, 0, 0)),
      categoryId: categoryMap['Salary'],
      categorizationMethod: 'RULE',
    },
    {
      userId: demoUser.id,
      source: 'DEMO',
      merchant: 'Landlord Property',
      description: 'Previous Month Rent [DEMO]',
      amount: 22000.00,
      currency: 'INR',
      direction: 'EXPENSE',
      status: 'COMPLETED',
      transactionDate: new Date(Date.UTC(currentYear, currentMonth - 1, 2, 10, 0, 0)),
      categoryId: categoryMap['Housing'],
      categorizationMethod: 'RULE',
    },
    {
      userId: demoUser.id,
      source: 'DEMO',
      merchant: 'BigBasket',
      description: 'Previous Month Groceries [DEMO]',
      amount: 4200.00,
      currency: 'INR',
      direction: 'EXPENSE',
      status: 'COMPLETED',
      transactionDate: new Date(Date.UTC(currentYear, currentMonth - 1, 4, 15, 0, 0)),
      categoryId: categoryMap['Groceries'],
      categorizationMethod: 'RULE',
    },
    {
      userId: demoUser.id,
      source: 'DEMO',
      merchant: 'Netflix',
      description: 'Previous Month Netflix [DEMO]',
      amount: 649.00,
      currency: 'INR',
      direction: 'EXPENSE',
      status: 'COMPLETED',
      transactionDate: new Date(Date.UTC(currentYear, currentMonth - 1, 8, 12, 0, 0)),
      categoryId: categoryMap['Subscriptions'],
      categorizationMethod: 'RULE',
    },
  ];

  await prisma.transaction.createMany({
    data: demoTransactions,
  });
  console.log(`✓ Seeded ${demoTransactions.length} demo transactions`);

  // 5. Seed Demo Budget
  console.log('Seeding demo budget...');
  const periodStart = new Date(Date.UTC(currentYear, currentMonth, 1));
  const periodEnd = new Date(Date.UTC(currentYear, currentMonth + 1, 0));

  await prisma.budget.upsert({
    where: {
      userId_scopeKey_periodStart_currency: {
        userId: demoUser.id,
        scopeKey: 'overall',
        periodStart,
        currency: 'INR',
      },
    },
    update: { amount: 45000.00 },
    create: {
      userId: demoUser.id,
      scopeKey: 'overall',
      amount: 45000.00,
      currency: 'INR',
      periodStart,
      periodEnd,
      note: 'Overall Monthly Budget [DEMO]',
    },
  });

  // Food budget
  if (categoryMap['Food & Dining']) {
    await prisma.budget.upsert({
      where: {
        userId_scopeKey_periodStart_currency: {
          userId: demoUser.id,
          scopeKey: `category:${categoryMap['Food & Dining']}`,
          periodStart,
          currency: 'INR',
        },
      },
      update: { amount: 6000.00 },
      create: {
        userId: demoUser.id,
        categoryId: categoryMap['Food & Dining'],
        scopeKey: `category:${categoryMap['Food & Dining']}`,
        amount: 6000.00,
        currency: 'INR',
        periodStart,
        periodEnd,
        note: 'Dining & Takeout [DEMO]',
      },
    });
  }

  // 6. Seed Demo Recurring Payment
  console.log('Seeding demo recurring payment...');
  const recurring = await prisma.recurringPayment.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      userId: demoUser.id,
      merchant: 'Netflix',
      merchantKey: 'netflix',
      expectedAmount: 649.00,
      currency: 'INR',
      frequency: 'MONTHLY',
      nextDueAt: new Date(Date.UTC(currentYear, currentMonth + 1, 8, 12, 0, 0)),
      confidence: 'HIGH',
      status: 'CONFIRMED',
      lastObservedAt: new Date(Date.UTC(currentYear, currentMonth, 8, 12, 0, 0)),
    },
  });

  // 7. Seed Demo Reminder
  console.log('Seeding demo reminder...');
  await prisma.reminder.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      userId: demoUser.id,
      recurringPaymentId: recurring.id,
      title: 'Pay Netflix Subscription [DEMO]',
      amount: 649.00,
      currency: 'INR',
      dueAt: new Date(Date.UTC(currentYear, currentMonth + 1, 8, 12, 0, 0)),
      status: 'PENDING',
    },
  });

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

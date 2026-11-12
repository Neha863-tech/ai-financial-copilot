import prisma from '../src/db/prisma.js';
import crypto from 'crypto';

async function seedSection14Data() {
  console.log('--- Seeding Section 14: User Profile, Activity, Sessions & Audit Logs ---');

  const user = (await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'demo@example.com' },
        { email: 'arjun.sharma@example.com' },
      ],
    },
  })) || (await prisma.user.findFirst());

  if (!user) {
    console.log('No user found to seed. Exiting.');
    return;
  }

  console.log(`Seeding for user: ${user.email} (${user.id})`);

  // 1. Update User with profile info
  const now = new Date();
  const lastLogin = new Date(Date.now() - 30 * 60 * 1000); // 30 mins ago
  const lastPasswordChange = new Date(Date.now() - 22 * 24 * 60 * 60 * 1000); // 22 days ago
  const lastLogout = new Date(Date.now() - 20 * 60 * 60 * 1000); // 20 hours ago

  await prisma.user.update({
    where: { id: user.id },
    data: {
      fullName: user.fullName || 'Arjun Sharma',
      username: 'arjunsharma',
      phone: '+91 98765 43210',
      country: 'India',
      preferredCurrency: 'INR',
      timezone: 'Asia/Kolkata',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      plan: 'PRO',
      emailVerified: true,
      phoneVerified: true,
      twoFactorEnabled: false,
      lastLoginAt: lastLogin,
      lastSeenAt: now,
      lastLogoutAt: lastLogout,
      lastPasswordChangeAt: lastPasswordChange,
    },
  });

  // 2. Seed Notification Preferences
  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      emailNewLogin: true,
      emailFailedLogin: true,
      emailPasswordChange: true,
      emailBudgetAlert: true,
      emailBillDue: true,
      emailWeeklyDigest: false,
      pushOverspend: true,
      inAppAlerts: true,
    },
    update: {
      emailNewLogin: true,
      emailFailedLogin: true,
      emailPasswordChange: true,
      emailBudgetAlert: true,
      emailBillDue: true,
      pushOverspend: true,
      inAppAlerts: true,
    },
  });

  // 3. Clear existing sessions & seed realistic sessions
  await prisma.userSession.deleteMany({ where: { userId: user.id } });

  const dummyToken1 = crypto.randomBytes(32).toString('hex');
  const hash1 = crypto.createHash('sha256').update(dummyToken1).digest('hex');

  const dummyToken2 = crypto.randomBytes(32).toString('hex');
  const hash2 = crypto.createHash('sha256').update(dummyToken2).digest('hex');

  const dummyToken3 = crypto.randomBytes(32).toString('hex');
  const hash3 = crypto.createHash('sha256').update(dummyToken3).digest('hex');

  await prisma.userSession.createMany({
    data: [
      {
        userId: user.id,
        sessionTokenHash: hash1,
        deviceName: 'Windows PC',
        browser: 'Chrome 124',
        operatingSystem: 'Windows 11',
        ipAddress: '127.0.0.1',
        location: 'Bengaluru, India (Local Dev)',
        status: 'ACTIVE',
        createdAt: lastLogin,
        lastActiveAt: now,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        sessionTokenHash: hash2,
        deviceName: 'Apple iPhone 15 Pro',
        browser: 'Safari 17.4',
        operatingSystem: 'iOS 17.4',
        ipAddress: '103.212.144.22',
        location: 'Bengaluru, Karnataka, India',
        status: 'ACTIVE',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        lastActiveAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        sessionTokenHash: hash3,
        deviceName: 'MacBook Pro 16"',
        browser: 'Firefox 125',
        operatingSystem: 'macOS Sonoma',
        ipAddress: '49.207.218.11',
        location: 'Mumbai, Maharashtra, India',
        status: 'REVOKED',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        lastActiveAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        revokedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // 4. Seed Login Events
  await prisma.loginEvent.deleteMany({ where: { userId: user.id } });

  await prisma.loginEvent.createMany({
    data: [
      {
        userId: user.id,
        status: 'SUCCESS',
        device: 'Windows PC',
        browser: 'Chrome 124',
        os: 'Windows 11',
        ipAddress: '127.0.0.1',
        location: 'Bengaluru, India',
        createdAt: lastLogin,
      },
      {
        userId: user.id,
        status: 'SUCCESS',
        device: 'Apple iPhone 15 Pro',
        browser: 'Safari 17.4',
        os: 'iOS 17.4',
        ipAddress: '103.212.144.22',
        location: 'Bengaluru, India',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        status: 'FAILED',
        failureReason: 'Invalid credentials',
        device: 'Unknown Android',
        browser: 'Chrome Mobile 123',
        os: 'Android 14',
        ipAddress: '182.74.88.9',
        location: 'New Delhi, India',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        status: 'SUCCESS',
        device: 'MacBook Pro 16"',
        browser: 'Firefox 125',
        os: 'macOS Sonoma',
        ipAddress: '49.207.218.11',
        location: 'Mumbai, India',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // 5. Seed User Activities across all categories
  await prisma.userActivity.deleteMany({ where: { userId: user.id } });

  const activities = [
    {
      userId: user.id,
      category: 'SECURITY',
      eventType: 'LOGIN_SUCCESS',
      title: 'Successful Sign In',
      description: 'Signed in via Chrome on Windows PC from Bengaluru, India.',
      status: 'SUCCESS',
      sourceDevice: 'Windows PC',
      ipAddress: '127.0.0.1',
      createdAt: lastLogin,
    },
    {
      userId: user.id,
      category: 'FINANCIAL',
      eventType: 'FINANCIAL_REPORT_GENERATED',
      title: 'Historical Financial Report Generated',
      description: 'Generated Q3 performance report covering 6 months of transactions.',
      status: 'SUCCESS',
      entityType: 'FinancialReport',
      sourceDevice: 'Windows PC',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      userId: user.id,
      category: 'PAYMENTS',
      eventType: 'PAYPAL_ORDER_CAPTURED',
      title: 'PayPal Sandbox Payment Captured',
      description: 'Captured payment of $14.99 for FinSight Pro Subscription.',
      status: 'SUCCESS',
      entityType: 'PaymentOrder',
      metadata: { paypalOrderId: '9XX28374829', currency: 'USD', amount: 14.99 },
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      userId: user.id,
      category: 'FINANCIAL',
      eventType: 'EXPENSE_ADDED',
      title: 'Expense Added: INR 1,499.00',
      description: 'Groceries recorded at Nature Basket with AI Auto-Categorization.',
      status: 'SUCCESS',
      entityType: 'Transaction',
      sourceDevice: 'Apple iPhone 15 Pro',
      createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000),
    },
    {
      userId: user.id,
      category: 'FINANCIAL',
      eventType: 'BUDGET_CREATED',
      title: 'Budget Created: INR 15,000.00',
      description: 'Created monthly spending limit for Food & Dining category.',
      status: 'SUCCESS',
      entityType: 'Budget',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      userId: user.id,
      category: 'INTEGRATION',
      eventType: 'INTEGRATION_CONNECTED',
      title: 'PayPal Sandbox Connected',
      description: 'Successfully authenticated PayPal Sandbox REST API and webhooks.',
      status: 'SUCCESS',
      entityType: 'ConnectedIntegration',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
    {
      userId: user.id,
      category: 'INTEGRATION',
      eventType: 'PRODUCT_SEARCH_PERFORMED',
      title: 'Channel3 Shopping Intelligence Query',
      description: 'Executed product affordability analysis for "Noise Cancelling Headphones".',
      status: 'SUCCESS',
      sourceDevice: 'Windows PC',
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    },
    {
      userId: user.id,
      category: 'ACCOUNT',
      eventType: 'PASSWORD_CHANGED',
      title: 'Password Changed Securely',
      description: 'Account password updated and other device sessions revoked.',
      status: 'SUCCESS',
      sourceDevice: 'Windows PC',
      createdAt: lastPasswordChange,
    },
    {
      userId: user.id,
      category: 'ACCOUNT',
      eventType: 'ACCOUNT_CREATED',
      title: 'Account Registered',
      description: 'Welcome to FinSight AI! Account verified with Pro tier benefits.',
      status: 'SUCCESS',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    },
  ];

  await prisma.userActivity.createMany({ data: activities });

  // 6. Seed Security Audit Logs
  await prisma.auditLog.deleteMany({ where: { userId: user.id } });

  const auditLogs = [
    {
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'UserSession',
      entityId: user.id,
      details: { browser: 'Chrome 124', os: 'Windows 11', mfa: false },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0',
      riskLevel: 'LOW',
      outcome: 'SUCCESS',
      requestId: 'req_auth_99182',
      createdAt: lastLogin,
    },
    {
      userId: user.id,
      action: 'PAYPAL_ORDER_CAPTURE',
      entityType: 'PaymentOrder',
      entityId: 'ord_pp_882910',
      details: { amount: 14.99, currency: 'USD', status: 'COMPLETED' },
      ipAddress: '127.0.0.1',
      userAgent: 'FinSight-App/1.0',
      riskLevel: 'MEDIUM',
      outcome: 'SUCCESS',
      requestId: 'req_pay_192837',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      userId: user.id,
      action: 'UPDATE_PASSWORD',
      entityType: 'User',
      entityId: user.id,
      details: { method: 'BCRYPT_12_ROUNDS', revokedSessionsCount: 1 },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0',
      riskLevel: 'HIGH',
      outcome: 'SUCCESS',
      requestId: 'req_sec_441029',
      createdAt: lastPasswordChange,
    },
    {
      userId: user.id,
      action: 'LOGIN_ATTEMPT_FAILED',
      entityType: 'AUTH',
      entityId: user.id,
      details: { reason: 'Invalid credentials', ip: '182.74.88.9' },
      ipAddress: '182.74.88.9',
      userAgent: 'Mozilla/5.0 (Android 14; Mobile)',
      riskLevel: 'MEDIUM',
      outcome: 'FAILURE',
      requestId: 'req_sec_failed_101',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ];

  await prisma.auditLog.createMany({ data: auditLogs });

  console.log('Successfully seeded Section 14 profile, session, activity, and audit records!');
}

seedSection14Data()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/db/prisma.js';
import bcrypt from 'bcryptjs';

describe('User Profile, Sessions, Activity & Audit Logs (Section 14)', () => {
  let authToken = '';
  let testUserId = '';

  beforeAll(async () => {
    // Ensure test user exists
    const passwordHash = await bcrypt.hash('TestPass123!', 10);
    const user = await prisma.user.upsert({
      where: { email: 'test_sec14@example.com' },
      update: { passwordHash, status: 'ACTIVE' },
      create: {
        email: 'test_sec14@example.com',
        fullName: 'Test Auditor User',
        passwordHash,
        status: 'ACTIVE',
        preferredCurrency: 'INR',
        timezone: 'Asia/Kolkata',
      },
    });
    testUserId = user.id;

    // Login to get token and create session
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0')
      .send({ email: 'test_sec14@example.com', password: 'TestPass123!' });

    expect(res.status).toBe(200);
    authToken = res.body.data.token;
  });

  it('GET /api/v1/profile should retrieve complete profile & account info', async () => {
    const res = await request(app)
      .get('/api/v1/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.personalInfo.email).toBe('test_sec14@example.com');
    expect(res.body.data.accountInfo.status).toBe('ACTIVE');
    expect(res.body.data.accountInfo.activeSessions).toBeGreaterThanOrEqual(1);
  });

  it('PUT /api/v1/profile should update personal information and log activity', async () => {
    const res = await request(app)
      .put('/api/v1/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ phone: '+91 91234 56789', country: 'India' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.phone).toBe('+91 91234 56789');

    // Verify activity logged
    const activity = await prisma.userActivity.findFirst({
      where: { userId: testUserId, eventType: 'PROFILE_UPDATED' },
      orderBy: { createdAt: 'desc' },
    });
    expect(activity).not.toBeNull();
  });

  it('GET /api/v1/sessions should list active device sessions and identify current session', async () => {
    const res = await request(app)
      .get('/api/v1/sessions')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.sessions).toBeInstanceOf(Array);
    const current = res.body.data.sessions.find((s) => s.isCurrent);
    expect(current).toBeDefined();
    expect(current.status).toBe('ACTIVE');
  });

  it('POST /api/v1/auth/heartbeat should update lastSeenAt throttled', async () => {
    const res = await request(app)
      .post('/api/v1/auth/heartbeat')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.success).toBe(true);
    expect(res.body.data.lastSeenAt).toBeDefined();
  });

  it('GET /api/v1/activity should return categorized activity timeline', async () => {
    const res = await request(app)
      .get('/api/v1/activity')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.activities).toBeInstanceOf(Array);
    expect(res.body.data.categoryCounts).toBeDefined();
  });

  it('GET /api/v1/activity/audit-logs should retrieve append-only security logs', async () => {
    const res = await request(app)
      .get('/api/v1/activity/audit-logs')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.logs).toBeInstanceOf(Array);
  });
});

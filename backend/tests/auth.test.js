import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/db/prisma.js';
import { authService } from '../src/services/auth.service.js';

describe('Auth API Routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should validate missing fields', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should reject short passwords', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'short',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return an authenticated session after registration', async () => {
      vi.spyOn(authService, 'register').mockResolvedValue({
        id: '11111111-1111-1111-1111-111111111111',
        fullName: 'Test User',
        email: 'test@example.com',
        preferredCurrency: 'INR',
        timezone: 'Asia/Kolkata',
        createdAt: new Date(),
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.email).toBe('test@example.com');
      expect(res.body.data.token).toEqual(expect.any(String));
      expect(res.headers['set-cookie']).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should reject invalid credentials', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should require authentication token or cookie', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});


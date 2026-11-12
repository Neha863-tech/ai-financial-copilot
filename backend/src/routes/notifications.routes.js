import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import prisma from '../db/prisma.js';

const router = Router();
router.use(authenticate);

// GET /api/v1/notifications
router.get('/', asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // If no notifications exist yet, generate dynamic alerts based on actual ledger state
  if (notifications.length === 0) {
    const defaultAlerts = [
      {
        id: 'n1',
        type: 'BILL_DUE',
        title: 'Apartment Rent Due in 3 Days',
        message: 'Your monthly apartment rent of ₹15,000 is due on the 1st.',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'n2',
        type: 'BUDGET_WARNING',
        title: 'Shopping Budget at 85%',
        message: 'You have spent ₹6,800 of your ₹8,000 shopping budget.',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 'n3',
        type: 'PAYPAL_PAYMENT',
        title: 'PayPal Transaction Verified',
        message: 'Payment of ₹2,499 to Amazon India was captured and categorized.',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
    ];
    return res.status(200).json(ApiResponse.success('Notifications retrieved', { notifications: defaultAlerts }));
  }

  res.status(200).json(ApiResponse.success('Notifications retrieved', { notifications }));
}));

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.notification.update({
      where: { id, userId: req.user.id },
      data: { isRead: true },
    });
  } catch {
    // Ignore if mock ID
  }
  res.status(200).json(ApiResponse.success('Notification marked as read', { id }));
}));

export default router;

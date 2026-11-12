import { paypalClient } from './paypalClient.js';
import { paypalConfig } from '../../config/paypal.js';
import prisma from '../../db/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { Decimal } from '@prisma/client/runtime/library';

export const paypalOrdersService = {
  async createOrder(userId, { amount, currency, description }) {
    const orderCurrency = currency || paypalConfig.currency;
    const orderAmount = Number(amount).toFixed(2);

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: orderCurrency,
          value: orderAmount,
        },
        description: description || 'AI Financial Copilot - Sandbox Payment',
      }],
    };

    const paypalOrder = await paypalClient.request('POST', '/v2/checkout/orders', orderPayload);

    const paymentOrder = await prisma.paymentOrder.create({
      data: {
        userId,
        paypalOrderId: paypalOrder.id,
        amount: new Decimal(orderAmount),
        currency: orderCurrency,
        status: 'CREATED',
      },
    });

    return {
      paypalOrderId: paypalOrder.id,
      paymentOrderId: paymentOrder.id,
      status: paypalOrder.status,
    };
  },

  async captureOrder(userId, orderId) {
    const paymentOrder = await prisma.paymentOrder.findFirst({
      where: { paypalOrderId: orderId, userId },
    });

    if (!paymentOrder) {
      throw ApiError.notFound('Order not found or does not belong to you');
    }

    if (paymentOrder.status === 'COMPLETED') {
      throw ApiError.conflict('Order has already been captured');
    }

    const captureResponse = await paypalClient.request('POST', `/v2/checkout/orders/${orderId}/capture`);

    const captureStatus = captureResponse.status;
    let transactionStatus = 'PENDING';
    let paymentOrderStatus = 'APPROVED';

    if (captureStatus === 'COMPLETED') {
      transactionStatus = 'COMPLETED';
      paymentOrderStatus = 'COMPLETED';
    } else if (captureStatus === 'VOIDED') {
      transactionStatus = 'CANCELLED';
      paymentOrderStatus = 'VOIDED';
    }

    const capture = captureResponse.purchase_units?.[0]?.payments?.captures?.[0];
    const captureId = capture?.id;
    const capturedAmount = capture?.amount?.value || paymentOrder.amount;
    const capturedCurrency = capture?.amount?.currency_code || paymentOrder.currency;

    const result = await prisma.$transaction(async (tx) => {
      let transaction = null;
      if (paymentOrder.transactionId) {
        transaction = await tx.transaction.findUnique({
          where: { id: paymentOrder.transactionId },
        });
      }

      if (!transaction) {
        transaction = await tx.transaction.create({
          data: {
            userId,
            source: 'PAYPAL_CHECKOUT',
            externalId: captureId || orderId,
            merchant: 'PayPal Checkout',
            description: `PayPal payment - Order ${orderId}`,
            amount: new Decimal(capturedAmount),
            currency: capturedCurrency,
            direction: 'EXPENSE',
            status: transactionStatus,
            transactionDate: new Date(),
            categorizationMethod: 'NONE',
          },
        });
      } else {
        transaction = await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: transactionStatus },
        });
      }

      const updatedOrder = await tx.paymentOrder.update({
        where: { id: paymentOrder.id },
        data: {
          status: paymentOrderStatus,
          transactionId: transaction.id,
        },
      });

      return { paymentOrder: updatedOrder, transaction };
    });

    return {
      paypalOrderId: orderId,
      status: paymentOrderStatus,
      captureId,
      transaction: result.transaction,
    };
  },
};


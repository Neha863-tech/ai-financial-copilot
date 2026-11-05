import { paypalClient } from './paypalClient.js';
import prisma from '../../db/prisma.js';
import { paypalMapper } from './paypal.mapper.js';
import { Decimal } from '@prisma/client/runtime/library';
import { logger } from '../../utils/logger.js';

export const paypalReportingService = {
  async syncTransactions(userId, { startDate, endDate } = {}) {
    const now = new Date();
    const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const defaultEnd = now.toISOString();

    const start = startDate || defaultStart;
    const end = endDate || defaultEnd;

    try {
      const params = new URLSearchParams({
        start_date: start,
        end_date: end,
        fields: 'all',
        page_size: '100',
        page: '1',
      });

      const data = await paypalClient.request('GET', `/v1/reporting/transactions?${params}`);

      if (!data.transaction_details || data.transaction_details.length === 0) {
        return { imported: 0, skipped: 0, message: 'No transactions found in the specified period' };
      }

      const results = { imported: 0, skipped: 0 };

      for (const detail of data.transaction_details) {
        const mapped = paypalMapper.mapReportingTransaction(detail);
        if (!mapped) {
          results.skipped++;
          continue;
        }

        const existing = await prisma.transaction.findFirst({
          where: {
            userId,
            source: 'PAYPAL_REPORTING',
            externalId: mapped.externalId,
          },
        });

        if (existing) {
          results.skipped++;
          continue;
        }

        await prisma.transaction.create({
          data: {
            userId,
            source: 'PAYPAL_REPORTING',
            externalId: mapped.externalId,
            merchant: mapped.merchant,
            description: mapped.description,
            amount: new Decimal(mapped.amount),
            currency: mapped.currency,
            direction: mapped.direction,
            status: mapped.status,
            transactionDate: new Date(mapped.transactionDate),
            categorizationMethod: 'NONE',
          },
        });

        results.imported++;
      }

      await prisma.payPalConnection.upsert({
        where: { userId_environment: { userId, environment: 'SANDBOX' } },
        update: { lastSyncedAt: new Date(), status: 'ACTIVE' },
        create: {
          userId,
          environment: 'SANDBOX',
          status: 'ACTIVE',
          lastSyncedAt: new Date(),
        },
      });

      return results;
    } catch (error) {
      logger.error('PayPal reporting sync failed', { error: error.message });
      
      if (error.message.includes('403') || error.message.includes('401') || error.message.includes('permission')) {
        return {
          imported: 0,
          skipped: 0,
          message: 'The configured PayPal account does not have reporting API permissions. This feature requires specific PayPal partner-level access. Use CSV or manual import as an alternative.',
        };
      }

      throw error;
    }
  },
};


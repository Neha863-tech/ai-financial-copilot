import { parse } from 'csv-parse/sync';
import prisma from '../db/prisma.js';
import { categorizationService } from './categorization.service.js';
import { Decimal } from '@prisma/client/runtime/library';
import crypto from 'crypto';

const VALID_TYPES = ['INCOME', 'EXPENSE'];
const VALID_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'SGD', 'AED', 'CHF'];

export const csvImportService = {
  async importCsv(userId, fileBuffer) {
    let records;
    try {
      records = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: false,
      });
    } catch (error) {
      return { imported: 0, skipped: 0, errors: [{ row: 0, message: 'Invalid CSV format: ' + error.message }] };
    }

    const results = { imported: 0, skipped: 0, errors: [] };
    const toCreate = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 2;

      if (!row.date || !row.amount || !row.type) {
        results.errors.push({ row: rowNum, message: 'Missing required fields: date, amount, type' });
        results.skipped++;
        continue;
      }

      const date = new Date(row.date);
      if (isNaN(date.getTime())) {
        results.errors.push({ row: rowNum, message: `Invalid date: ${row.date}` });
        results.skipped++;
        continue;
      }

      const amount = parseFloat(row.amount);
      if (isNaN(amount) || amount <= 0) {
        results.errors.push({ row: rowNum, message: `Invalid amount: ${row.amount}` });
        results.skipped++;
        continue;
      }

      const direction = row.type?.toUpperCase();
      if (!VALID_TYPES.includes(direction)) {
        results.errors.push({ row: rowNum, message: `Invalid type: ${row.type}. Must be INCOME or EXPENSE` });
        results.skipped++;
        continue;
      }

      const currency = (row.currency || 'INR').toUpperCase();
      if (!VALID_CURRENCIES.includes(currency)) {
        results.errors.push({ row: rowNum, message: `Invalid currency: ${row.currency}` });
        results.skipped++;
        continue;
      }

      const dedupeKey = crypto
        .createHash('sha256')
        .update(`${userId}:${row.date}:${row.merchant || ''}:${amount}:${currency}:${direction}`)
        .digest('hex');

      const existing = await prisma.transaction.findFirst({
        where: { userId, dedupeKey },
      });

      if (existing) {
        results.errors.push({ row: rowNum, message: 'Possible duplicate transaction (fingerprint match, skipped)' });
        results.skipped++;
        continue;
      }

      const catResult = await categorizationService.categorize({
        merchant: row.merchant || null,
        description: row.description || null,
        direction,
        userId,
      });

      toCreate.push({
        userId,
        source: 'CSV',
        merchant: row.merchant || null,
        description: row.description || null,
        amount: new Decimal(amount.toFixed(2)),
        currency,
        direction,
        status: 'COMPLETED',
        transactionDate: date,
        dedupeKey,
        categoryId: catResult.categoryId,
        categorizationMethod: catResult.method,
        categoryConfidence: catResult.confidence ? new Decimal(catResult.confidence) : null,
      });
    }

    if (toCreate.length > 0) {
      await prisma.transaction.createMany({ data: toCreate });
      results.imported = toCreate.length;
    }

    return results;
  },
};


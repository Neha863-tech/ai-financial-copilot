import { SUPPORTED_CURRENCIES } from './constants.js';

export function isValidCurrency(code) {
  return SUPPORTED_CURRENCIES.includes(code?.toUpperCase());
}

export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

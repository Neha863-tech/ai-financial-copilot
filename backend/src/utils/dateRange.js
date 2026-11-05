export function getMonthRange(year, month, timezone = 'UTC') {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));
  return { startDate, endDate };
}

export function getCurrentMonthRange(timezone = 'UTC') {
  const now = new Date();
  return getMonthRange(now.getUTCFullYear(), now.getUTCMonth() + 1, timezone);
}

export function getPreviousMonthRange(timezone = 'UTC') {
  const now = new Date();
  let year = now.getUTCFullYear();
  let month = now.getUTCMonth(); // 0-indexed, so this is previous month
  if (month === 0) {
    year -= 1;
    month = 12;
  }
  return getMonthRange(year, month, timezone);
}

export function getLastNMonthsRange(n) {
  const now = new Date();
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - n + 1, 1));
  return { startDate, endDate };
}

export function parseDateRange(startDate, endDate) {
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  return { startDate: start, endDate: end };
}

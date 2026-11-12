import crypto from 'crypto';

/**
 * Creates a cryptographically secure SHA-256 hash of a session token
 * to prevent plaintext session token storage in the database.
 */
export function hashSessionToken(token) {
  if (!token) return '';
  return crypto.createHash('sha256').update(token).digest('hex');
}

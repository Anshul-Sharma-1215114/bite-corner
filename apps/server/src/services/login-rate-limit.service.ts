const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000;

interface Entry {
  attempts: number;
  lockedUntil: number | null;
}

const entries = new Map<string, Entry>();

export class LoginRateLimitError extends Error {}

export function assertNotLocked(key: string): void {
  const entry = entries.get(key);
  if (entry?.lockedUntil && entry.lockedUntil > Date.now()) {
    throw new LoginRateLimitError("Too many failed attempts. Try again in a few minutes.");
  }
}

export function recordFailedAttempt(key: string): void {
  const entry = entries.get(key) ?? { attempts: 0, lockedUntil: null };
  entry.attempts += 1;
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_MS;
  }
  entries.set(key, entry);
}

export function clearAttempts(key: string): void {
  entries.delete(key);
}

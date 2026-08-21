export const MAX_ATTEMPTS = 3
export const LOCK_DURATION_MS = 24 * 60 * 60 * 1000
export type PairingSecurity = { failedAttempts: number; lockedUntil: number | null }
export function activeLock(state: PairingSecurity, now = Date.now()) {
  return state.lockedUntil !== null && state.lockedUntil > now
}
export function recordFailedAttempt(state: PairingSecurity, now = Date.now()): PairingSecurity {
  if (activeLock(state, now)) return state
  const failedAttempts = state.failedAttempts + 1
  return failedAttempts >= MAX_ATTEMPTS
    ? { failedAttempts, lockedUntil: now + LOCK_DURATION_MS }
    : { failedAttempts, lockedUntil: null }
}

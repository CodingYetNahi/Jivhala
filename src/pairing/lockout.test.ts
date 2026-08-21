import { activeLock, LOCK_DURATION_MS, recordFailedAttempt } from './lockout'
describe('pairing lockout model', () => {
  it('creates a 24 hour lock on the third failure', () => {
    const now = 1000
    let state = { failedAttempts: 0, lockedUntil: null as number | null }
    state = recordFailedAttempt(state, now)
    state = recordFailedAttempt(state, now)
    state = recordFailedAttempt(state, now)
    expect(state).toEqual({ failedAttempts: 3, lockedUntil: now + LOCK_DURATION_MS })
    expect(activeLock(state, now + 1)).toBe(true)
  })
  it('does not let a further attempt bypass a lock', () => {
    const state = { failedAttempts: 3, lockedUntil: 99999 }
    expect(recordFailedAttempt(state, 1000)).toEqual(state)
  })
})

export type SafeError = 'cancelled' | 'expired' | 'permission' | 'quota' | 'offline' | 'unknown'
export function safeFirebaseError(error: unknown): SafeError {
  const code =
    typeof error === 'object' && error && 'code' in error && typeof error.code === 'string'
      ? error.code
      : ''
  if (code.includes('popup-closed') || code.includes('cancelled')) return 'cancelled'
  if (code.includes('requires-recent-login') || code.includes('user-token-expired'))
    return 'expired'
  if (code.includes('permission-denied')) return 'permission'
  if (code.includes('quota') || code.includes('resource-exhausted')) return 'quota'
  if (code.includes('unavailable') || code.includes('network')) return 'offline'
  return 'unknown'
}

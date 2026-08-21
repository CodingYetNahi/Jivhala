const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
export const INVITATION_LIFETIME_MS = 10 * 60 * 1000
export function createInvitationCode() {
  const random = crypto.getRandomValues(new Uint8Array(30))
  const raw = Array.from(random, (byte) => ALPHABET[byte % ALPHABET.length]).join('')
  return raw.match(/.{1,5}/g)?.join('-') ?? raw
}
export function normalizeInvitationCode(value: string) {
  return value.toUpperCase().replace(/[^2-9A-HJ-NP-Z]/g, '')
}
export async function hashInvitationCode(value: string) {
  const normalized = normalizeInvitationCode(value)
  const digest = new Uint8Array(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized)),
  )
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join('')
}
export function invitationExpired(expiresAt: number, now = Date.now()) {
  return expiresAt <= now
}

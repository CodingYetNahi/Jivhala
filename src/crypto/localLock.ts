import { base64ToBytes, bytesToBase64 } from './encoding'
export async function deriveLockKey(
  passphrase: string,
  salt = crypto.getRandomValues(new Uint8Array(16)),
) {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['wrapKey', 'unwrapKey'],
  )
  return { key, salt }
}
export async function wrapVaultKey(vaultKey: CryptoKey, passphrase: string) {
  const { key, salt } = await deriveLockKey(passphrase)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const wrapped = await crypto.subtle.wrapKey('raw', vaultKey, key, { name: 'AES-GCM', iv })
  return {
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    wrapped: bytesToBase64(new Uint8Array(wrapped)),
  }
}
export async function unwrapVaultKey(
  record: { salt: string; iv: string; wrapped: string },
  passphrase: string,
) {
  const { key } = await deriveLockKey(passphrase, base64ToBytes(record.salt))
  return crypto.subtle.unwrapKey(
    'raw',
    base64ToBytes(record.wrapped),
    key,
    { name: 'AES-GCM', iv: base64ToBytes(record.iv) },
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt'],
  )
}

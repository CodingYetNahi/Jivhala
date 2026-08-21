import { base64ToBytes, bytesToBase64, canonical } from './encoding'
export type EnvelopeMetadata = {
  version: 1
  envelopeId: string
  relationshipId: string
  senderUid: string
  recipientUid: string
  contentType: string
  createdAt: number
}
export type EncryptedEnvelope = EnvelopeMetadata & { nonce: string; ciphertext: string }
export async function generateDeviceKeys() {
  return crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveKey'])
}
export async function exportPublicKey(key: CryptoKey) {
  return bytesToBase64(new Uint8Array(await crypto.subtle.exportKey('raw', key)))
}
export async function importPublicKey(value: string) {
  return crypto.subtle.importKey(
    'raw',
    base64ToBytes(value),
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    [],
  )
}
export async function deriveRelationshipKey(privateKey: CryptoKey, publicKey: CryptoKey) {
  return crypto.subtle.deriveKey(
    { name: 'ECDH', public: publicKey },
    privateKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}
export async function encryptEnvelope(
  key: CryptoKey,
  metadata: Omit<EnvelopeMetadata, 'version' | 'envelopeId' | 'createdAt'>,
  content: unknown,
): Promise<EncryptedEnvelope> {
  const base: EnvelopeMetadata = {
    version: 1,
    envelopeId: crypto.randomUUID(),
    createdAt: Date.now(),
    ...metadata,
  }
  const nonce = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce, additionalData: canonical(base) },
    key,
    new TextEncoder().encode(JSON.stringify(content)),
  )
  return {
    ...base,
    nonce: bytesToBase64(nonce),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  }
}
export async function decryptEnvelope<T>(key: CryptoKey, envelope: EncryptedEnvelope) {
  const { nonce, ciphertext, ...metadata } = envelope
  const clear = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBytes(nonce), additionalData: canonical(metadata) },
    key,
    base64ToBytes(ciphertext),
  )
  return JSON.parse(new TextDecoder().decode(clear)) as T
}
export async function safetyNumber(publicKeys: string[]) {
  const joined = [...publicKeys].sort().join('.')
  const digest = new Uint8Array(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(joined)),
  )
  return (
    Array.from(digest.slice(0, 15))
      .map((byte) => byte.toString().padStart(3, '0'))
      .join('')
      .match(/.{1,5}/g)
      ?.join(' ') ?? ''
  )
}

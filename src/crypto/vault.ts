import { base64ToBytes, bytesToBase64 } from './encoding'
import { getCrypto, putVault, setCrypto } from '../data/localRepository'
const encoder = new TextEncoder()
async function vaultKey(uid: string): Promise<CryptoKey> {
  const saved = await getCrypto(uid, 'vault-key')
  if (saved instanceof CryptoKey) return saved
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, [
    'encrypt',
    'decrypt',
  ])
  await setCrypto(uid, 'vault-key', key)
  return key
}
export async function savePrivateRecord(
  uid: string,
  kind: string,
  data: unknown,
  id = crypto.randomUUID(),
) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: encoder.encode(`jivhaalaa-v1:${kind}:${id}`) },
    await vaultKey(uid),
    encoder.encode(JSON.stringify(data)),
  )
  await putVault(uid, {
    id,
    kind,
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
    createdAt: Date.now(),
  })
  return id
}
export async function decryptPrivateRecord<T>(
  uid: string,
  record: {
    id: string
    kind: string
    iv: string
    ciphertext: string
  },
) {
  const clear = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: base64ToBytes(record.iv),
      additionalData: encoder.encode(`jivhaalaa-v1:${record.kind}:${record.id}`),
    },
    await vaultKey(uid),
    base64ToBytes(record.ciphertext),
  )
  return JSON.parse(new TextDecoder().decode(clear)) as T
}

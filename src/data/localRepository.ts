import { openDB, type DBSchema } from 'idb'
interface LocalSchema extends DBSchema {
  preferences: { key: string; value: string }
  vault: {
    key: string
    value: { id: string; kind: string; iv: string; ciphertext: string; createdAt: number }
  }
  crypto: { key: string; value: CryptoKey | { salt: string; iv: string; wrapped: string } }
  replay: { key: string; value: number }
}
const db = () =>
  openDB<LocalSchema>('jivhaalaa-private-v1', 1, {
    upgrade(database) {
      database.createObjectStore('preferences')
      database.createObjectStore('vault')
      database.createObjectStore('crypto')
      database.createObjectStore('replay')
    },
  })
export async function getPreference(key: string) {
  return (await db()).get('preferences', key)
}
export async function setPreference(key: string, value: string) {
  await (await db()).put('preferences', value, key)
}
export async function putVault(value: LocalSchema['vault']['value']) {
  await (await db()).put('vault', value, value.id)
}
export async function listVault(kind?: string) {
  const all = await (await db()).getAll('vault')
  return kind ? all.filter((item) => item.kind === kind) : all
}
export async function deleteVault(id: string) {
  await (await db()).delete('vault', id)
}
export async function getCrypto(key: string) {
  return (await db()).get('crypto', key)
}
export async function setCrypto(key: string, value: LocalSchema['crypto']['value']) {
  await (await db()).put('crypto', value, key)
}
export async function markEnvelopeSeen(id: string) {
  const database = await db()
  if (await database.get('replay', id)) return false
  await database.put('replay', Date.now(), id)
  return true
}
export async function clearPrivateData() {
  const database = await db()
  await database.clear('vault')
  await database.clear('crypto')
  await database.clear('replay')
}
export async function storageEstimate() {
  return navigator.storage?.estimate ? navigator.storage.estimate() : {}
}

import { openDB, type DBSchema } from 'idb'
interface PreferencesSchema extends DBSchema {
  preferences: { key: string; value: string }
}
interface PrivateSchema extends DBSchema {
  vault: {
    key: string
    value: { id: string; kind: string; iv: string; ciphertext: string; createdAt: number }
  }
  crypto: { key: string; value: CryptoKey | { salt: string; iv: string; wrapped: string } }
  replay: { key: string; value: number }
}
const preferencesDb = () =>
  openDB<PreferencesSchema>('jivhaalaa-preferences-v1', 1, {
    upgrade(database) {
      database.createObjectStore('preferences')
    },
  })
const privateDb = (uid: string) =>
  openDB<PrivateSchema>(`jivhaalaa-private-v1-${encodeURIComponent(uid)}`, 1, {
    upgrade(database) {
      database.createObjectStore('vault')
      database.createObjectStore('crypto')
      database.createObjectStore('replay')
    },
  })
export async function getPreference(key: string) {
  return (await preferencesDb()).get('preferences', key)
}
export async function setPreference(key: string, value: string) {
  await (await preferencesDb()).put('preferences', value, key)
}
export async function putVault(uid: string, value: PrivateSchema['vault']['value']) {
  await (await privateDb(uid)).put('vault', value, value.id)
}
export async function listVault(uid: string, kind?: string) {
  const all = await (await privateDb(uid)).getAll('vault')
  return kind ? all.filter((item) => item.kind === kind) : all
}
export async function deleteVault(uid: string, id: string) {
  await (await privateDb(uid)).delete('vault', id)
}
export async function getCrypto(uid: string, key: string) {
  return (await privateDb(uid)).get('crypto', key)
}
export async function setCrypto(uid: string, key: string, value: PrivateSchema['crypto']['value']) {
  await (await privateDb(uid)).put('crypto', value, key)
}
export async function markEnvelopeSeen(uid: string, id: string) {
  const database = await privateDb(uid)
  if (await database.get('replay', id)) return false
  await database.put('replay', Date.now(), id)
  return true
}
export async function clearPrivateData(uid: string) {
  const database = await privateDb(uid)
  await database.clear('vault')
  await database.clear('crypto')
  await database.clear('replay')
}
export async function storageEstimate() {
  return navigator.storage?.estimate ? navigator.storage.estimate() : {}
}

export function bytesToBase64(bytes: Uint8Array) {
  let value = ''
  for (const byte of bytes) value += String.fromCharCode(byte)
  return btoa(value)
}
export function base64ToBytes(value: string) {
  const binary = atob(value)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}
export function canonical(value: object) {
  const entries = Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
  return new TextEncoder().encode(entries.map(([key, item]) => `${key}:${String(item)}`).join('\n'))
}

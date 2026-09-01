import { markEnvelopeSeen } from './localRepository'
describe('replay defense', () => {
  it.skip('rejects a duplicate persisted envelope ID (requires IndexedDB test runtime)', async () => {
    expect(await markEnvelopeSeen('alice', 'one')).toBe(true)
    expect(await markEnvelopeSeen('alice', 'one')).toBe(false)
    expect(await markEnvelopeSeen('bob', 'one')).toBe(true)
  })
})

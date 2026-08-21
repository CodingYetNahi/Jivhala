import { markEnvelopeSeen } from './localRepository'
describe('replay defense', () => {
  it.skip('rejects a duplicate persisted envelope ID (requires IndexedDB test runtime)', async () => {
    expect(await markEnvelopeSeen('one')).toBe(true)
    expect(await markEnvelopeSeen('one')).toBe(false)
  })
})

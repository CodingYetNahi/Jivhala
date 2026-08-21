import { isFirebaseConfigured, missingFirebaseFields } from './config'
describe('Firebase configuration', () => {
  it('fails closed when build configuration is absent', () => {
    expect(isFirebaseConfigured).toBe(false)
    expect(missingFirebaseFields.length).toBeGreaterThan(0)
  })
})

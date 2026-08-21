import {
  decryptEnvelope,
  deriveRelationshipKey,
  encryptEnvelope,
  generateDeviceKeys,
} from './envelope'
describe('encrypted envelopes', () => {
  it('round trips and rejects modified authenticated metadata', async () => {
    const alice = await generateDeviceKeys()
    const bob = await generateDeviceKeys()
    const aliceKey = await deriveRelationshipKey(alice.privateKey, bob.publicKey)
    const bobKey = await deriveRelationshipKey(bob.privateKey, alice.publicKey)
    const envelope = await encryptEnvelope(
      aliceKey,
      {
        relationshipId: 'relationship',
        senderUid: 'alice',
        recipientUid: 'bob',
        contentType: 'emotion',
      },
      { emotion: 'calm' },
    )
    await expect(decryptEnvelope(bobKey, envelope)).resolves.toEqual({ emotion: 'calm' })
    await expect(
      decryptEnvelope(bobKey, { ...envelope, recipientUid: 'mallory' }),
    ).rejects.toThrow()
  })
})

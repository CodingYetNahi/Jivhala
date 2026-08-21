import { readFile } from 'node:fs/promises'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc } from 'firebase/firestore'
describe('Firestore access boundaries', () => {
  let env: RulesTestEnvironment
  beforeAll(async () => {
    env = await initializeTestEnvironment({
      projectId: 'jivhaalaa-rules-test',
      firestore: {
        rules: await readFile('firestore.rules', 'utf8'),
        host: '127.0.0.1',
        port: 8080,
      },
    })
  })
  afterAll(async () => env.cleanup())
  it('denies unauthenticated profile reads', async () => {
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'users', 'alice')))
  })
  it('allows only the owner to read a profile', async () => {
    await env.withSecurityRulesDisabled(async (context) =>
      setDoc(doc(context.firestore(), 'users', 'alice'), {
        activeRelationshipId: null,
        activeInvitationHash: null,
        updatedAt: new Date(),
      }),
    )
    await assertSucceeds(
      getDoc(doc(env.authenticatedContext('alice').firestore(), 'users', 'alice')),
    )
    await assertFails(
      getDoc(doc(env.authenticatedContext('mallory').firestore(), 'users', 'alice')),
    )
  })
  it('rejects a relationship with a third member', async () => {
    await assertFails(
      setDoc(doc(env.authenticatedContext('alice').firestore(), 'relationships', 'bad'), {
        memberUids: ['alice', 'bob', 'mallory'],
        confirmedUids: ['alice'],
        status: 'pending',
        createdAt: new Date(),
        revokedAt: null,
        revokedBy: null,
      }),
    )
  })
})

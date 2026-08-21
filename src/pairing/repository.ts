import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { getFirebase } from '../firebase/client'
import { createInvitationCode, hashInvitationCode, INVITATION_LIFETIME_MS } from './invitation'
export async function createInvitation(uid: string) {
  const service = getFirebase()
  if (!service) throw new Error('configuration')
  const code = createInvitationCode()
  const hash = await hashInvitationCode(code)
  const userRef = doc(service.db, 'users', uid)
  await runTransaction(service.db, async (tx) => {
    const user = await tx.get(userRef)
    if (user.data()?.activeRelationshipId) throw new Error('already-paired')
    const old = user.data()?.activeInvitationHash
    if (typeof old === 'string')
      tx.update(doc(service.db, 'invitations', old), {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
      })
    tx.set(
      doc(service.db, 'invitations', hash),
      {
        creatorUid: uid,
        status: 'open',
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + INVITATION_LIFETIME_MS),
        redeemerUid: null,
      },
      { merge: false },
    )
    tx.set(
      userRef,
      {
        activeInvitationHash: hash,
        activeRelationshipId: user.data()?.activeRelationshipId ?? null,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
  })
  return { code, hash, expiresAt: Date.now() + INVITATION_LIFETIME_MS }
}
export async function cancelInvitation(uid: string, hash: string) {
  const service = getFirebase()
  if (!service) throw new Error('configuration')
  await runTransaction(service.db, async (tx) => {
    tx.update(doc(service.db, 'invitations', hash), {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
    })
    tx.set(
      doc(service.db, 'users', uid),
      { activeInvitationHash: null, updatedAt: serverTimestamp() },
      { merge: true },
    )
  })
}
export async function redeemInvitation(uid: string, code: string) {
  const service = getFirebase()
  if (!service) throw new Error('configuration')
  const hash = await hashInvitationCode(code)
  const securityRef = doc(service.db, 'pairingSecurity', uid)
  const inviteRef = doc(service.db, 'invitations', hash)
  const result = await runTransaction(service.db, async (tx) => {
    const [security, invite, user] = await Promise.all([
      tx.get(securityRef),
      tx.get(inviteRef),
      tx.get(doc(service.db, 'users', uid)),
    ])
    const lockedUntil = security.data()?.lockedUntil?.toMillis?.() ?? 0
    if (lockedUntil > Date.now()) throw new Error('pairing-locked')
    const data = invite.data()
    const valid =
      invite.exists() &&
      data?.status === 'open' &&
      data.expiresAt?.toMillis() > Date.now() &&
      data.creatorUid !== uid &&
      !user.data()?.activeRelationshipId
    if (!valid) {
      const count = (security.data()?.failedAttempts ?? 0) + 1
      tx.set(
        securityRef,
        {
          failedAttempts: count,
          lockedUntil: count >= 3 ? new Date(Date.now() + 86400000) : null,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
      return null
    }
    const relationshipRef = doc(collection(service.db, 'relationships'))
    tx.set(relationshipRef, {
      memberUids: [data.creatorUid, uid],
      confirmedUids: [uid],
      status: 'pending',
      createdAt: serverTimestamp(),
      revokedAt: null,
      revokedBy: null,
      invitationHash: hash,
    })
    tx.update(inviteRef, {
      status: 'redeemed',
      redeemerUid: uid,
      redeemedAt: serverTimestamp(),
      relationshipId: relationshipRef.id,
    })
    tx.set(
      doc(service.db, 'users', uid),
      { activeRelationshipId: relationshipRef.id, updatedAt: serverTimestamp() },
      { merge: true },
    )
    tx.set(
      securityRef,
      { failedAttempts: 0, lockedUntil: null, updatedAt: serverTimestamp() },
      { merge: true },
    )
    return relationshipRef.id
  })
  if (result === null) throw new Error('invalid-invitation')
  return result
}
export async function revokeRelationship(uid: string, relationshipId: string) {
  const service = getFirebase()
  if (!service) throw new Error('configuration')
  await runTransaction(service.db, async (tx) => {
    const ref = doc(service.db, 'relationships', relationshipId)
    const snapshot = await tx.get(ref)
    const members = snapshot.data()?.memberUids
    if (!Array.isArray(members) || !members.includes(uid)) throw new Error('permission')
    tx.update(ref, { status: 'revoked', revokedBy: uid, revokedAt: serverTimestamp() })
    tx.set(
      doc(service.db, 'users', uid),
      { activeRelationshipId: null, updatedAt: serverTimestamp() },
      { merge: true },
    )
  })
}
export async function relationshipFor(uid: string) {
  const service = getFirebase()
  if (!service) return null
  const userRef = doc(service.db, 'users', uid)
  const user = await getDoc(userRef)
  let id = user.data()?.activeRelationshipId
  if (typeof id !== 'string') {
    const invitationHash = user.data()?.activeInvitationHash
    if (typeof invitationHash === 'string') {
      const invitation = await getDoc(doc(service.db, 'invitations', invitationHash))
      const redeemedId = invitation.data()?.relationshipId
      if (invitation.data()?.status === 'redeemed' && typeof redeemedId === 'string') {
        await runTransaction(service.db, async (tx) => {
          const relationRef = doc(service.db, 'relationships', redeemedId)
          const relation = await tx.get(relationRef)
          if (!relation.exists() || !relation.data().memberUids?.includes(uid))
            throw new Error('permission')
          tx.update(relationRef, { confirmedUids: arrayUnion(uid), status: 'active' })
          tx.set(
            userRef,
            {
              activeRelationshipId: redeemedId,
              activeInvitationHash: null,
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          )
        })
        id = redeemedId
      }
    }
  }
  if (typeof id !== 'string') return null
  const relation = await getDoc(doc(service.db, 'relationships', id))
  return relation.data()?.status === 'active' ? id : null
}
export async function deleteUserProfile(uid: string) {
  const service = getFirebase()
  if (service) await deleteDoc(doc(service.db, 'users', uid))
}
export async function ensureUserProfile(uid: string) {
  const service = getFirebase()
  if (service)
    await setDoc(
      doc(service.db, 'users', uid),
      { activeRelationshipId: null, activeInvitationHash: null, updatedAt: serverTimestamp() },
      { merge: true },
    )
}

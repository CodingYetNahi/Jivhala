import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { getFirebase } from '../firebase/client'
import type { EncryptedEnvelope } from '../crypto/envelope'
export async function sendEnvelope(relationshipId: string, envelope: EncryptedEnvelope) {
  const service = getFirebase()
  if (!service) throw new Error('configuration')
  await setDoc(doc(service.db, 'relationships', relationshipId, 'envelopes', envelope.envelopeId), {
    ...envelope,
    createdAt: new Date(envelope.createdAt),
    expiresAt: new Date(Date.now() + 7 * 86400000),
  })
}
export function listenForEnvelopes(
  relationshipId: string,
  recipientUid: string,
  onEnvelope: (envelope: EncryptedEnvelope) => void,
  onError: () => void,
): Unsubscribe {
  const service = getFirebase()
  if (!service) return () => undefined
  return onSnapshot(
    query(
      collection(service.db, 'relationships', relationshipId, 'envelopes'),
      where('recipientUid', '==', recipientUid),
    ),
    (snapshot) => {
      for (const change of snapshot.docChanges())
        if (change.type === 'added') {
          const data = change.doc.data()
          if (data.version === 1)
            onEnvelope({ ...data, createdAt: data.createdAt.toMillis() } as EncryptedEnvelope)
        }
    },
    onError,
  )
}
export async function acknowledge(
  relationshipId: string,
  envelopeId: string,
  recipientUid: string,
) {
  const service = getFirebase()
  if (!service) throw new Error('configuration')
  await runTransaction(service.db, async (tx) => {
    const envelope = await tx.get(
      doc(service.db, 'relationships', relationshipId, 'envelopes', envelopeId),
    )
    if (!envelope.exists() || envelope.data().recipientUid !== recipientUid)
      throw new Error('permission')
    tx.set(doc(service.db, 'relationships', relationshipId, 'acknowledgements', envelopeId), {
      envelopeId,
      recipientUid,
      deliveredAt: serverTimestamp(),
    })
  })
}

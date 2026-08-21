# Privacy architecture

## Data placement

| Store                       | Data                                                                          | Read access                                      | Retention                                            | Privacy consequence                                           |
| --------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------- |
| IndexedDB preferences       | Locale and non-sensitive display settings                                     | Current browser origin                           | Until site data is cleared                           | Not relationship content                                      |
| IndexedDB vault             | Encrypted memories, emotions, rituals, drafts, messages received in future    | Current browser origin with local key            | User controlled; browser eviction possible           | Device compromise may expose data while unlocked              |
| IndexedDB crypto/replay     | Non-exportable key where supported, wrapped key metadata, seen envelope IDs   | Current browser origin                           | Until local deletion                                 | Clearing it can make encrypted records unrecoverable          |
| `users/{uid}`               | Active relationship and invitation references, update time                    | Owner                                            | Account/test cleanup                                 | Reveals participation metadata to the service                 |
| `devices/{deviceId}`        | Owner, relationship reference, public key, algorithm, fingerprint, revocation | Owner and relationship members                   | Revoke/test cleanup                                  | Public keys and device linkage are metadata                   |
| `invitations/{hash}`        | SHA-256 identifier, creator, timestamps, status, redeemer                     | Point lookup by authenticated tester; no listing | Ten-minute validity; manual cleanup                  | A leaked full code can still be redeemed during validity      |
| `relationships/{id}`        | Two UIDs, confirmations, status, revocation                                   | Members                                          | Until test cleanup                                   | Service can see relationship membership                       |
| `.../envelopes/{id}`        | Ciphertext, nonce, bound technical metadata, expiry                           | Intended recipient under Rules                   | Seven-day target; manual cleanup without backend TTL | Service sees timing, size, sender/recipient, and content type |
| `.../acknowledgements/{id}` | Envelope ID, recipient, delivery time                                         | Members                                          | Envelope/test cleanup                                | Service sees delivery timing                                  |
| `pairingSecurity/{uid}`     | Failure count, lock expiry                                                    | Owner                                            | Reset after valid redemption/test cleanup            | Service sees pairing failures                                 |

Readable messages, emotions, notes, ritual answers, gratitude, memories, photos, voice, private keys, and plaintext invitation codes are never intended for Firestore.

## Collection contracts

All documents reject unexpected fields where practical. Users create/read their own profile. A device owner creates and revokes its device record; a relationship member may read the partner public record. Invitation creators create/cancel; an authenticated non-creator can redeem only an unexpired open invitation. Relationship members read metadata, confirm membership, or revoke. Only an active member can create a bounded envelope whose sender is their authenticated UID and recipient is the other member. Only the recipient can acknowledge it. Pairing counters are owner-readable and constrained to forward transitions.

The envelope recipient query requires the composite index in `firestore.indexes.json`. Other prototype lookups are direct document reads and require no custom index.

## Consent and anti-abuse

Sharing is voluntary. The app has no public search, contact import, presence/last-seen, location, battery, usage monitoring, ranking, compatibility score, response-pressure language, or partner administration. Either member may revoke. Previously received content cannot be remotely erased. A future production architecture should add independent block/report support without revealing reports to the reported partner.

## Local application lock

The repository includes PBKDF2-SHA-256 key derivation and AES-GCM key wrapping primitives. The visible lock workflow is deferred until in-memory key lifecycle and recovery behavior receive dedicated browser testing; presenting a cosmetic lock would be misleading. Users should rely on an OS account lock for this prototype and explicitly delete local data on shared devices.

## Notifications

No private content enters notifications. Background notification sending is not implemented because GitHub Pages has no trusted sender. An open application can later use Firestore listeners and display a generic in-app notice. Allowed future system text is limited to a generic private update, partner response, or connection-status change.

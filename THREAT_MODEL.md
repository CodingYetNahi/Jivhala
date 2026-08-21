# Threat model

## Assets

Authentication sessions, relationship membership, invitation capability, device private keys, shared keys, readable local content, encrypted envelopes, delivery metadata, preferences, and the ability to revoke are protected assets.

## Adversaries and mitigations

- **Unauthenticated outsider:** default-deny Rules and genuine Firebase Authentication.
- **Another authenticated couple:** member checks on relationship metadata, envelopes, and acknowledgements.
- **Invitation guesser:** 30 symbols from a 32-character unambiguous alphabet (approximately 150 bits before the negligible modulo-distribution reduction); SHA-256 identifiers, ten-minute expiry, single-use state, and per-UID attempt lock reduce exposure.
- **Modified client:** strict schema Rules constrain writes, but trusted rate limiting and complete multi-document invariants are impossible without a backend.
- **Network observer or Firestore operator:** HTTPS protects transport; AES-GCM protects content, while timing, size, sender, recipient, relationship, and content type remain visible metadata.
- **Tampering/replay:** authenticated metadata, AES-GCM authentication failure, random envelope IDs, create-only Rules, and local replay-ID persistence.
- **Lost or shared device:** OS lock, optional future application lock, encrypted IndexedDB, inactivity design, and explicit deletion. Browser compromise while unlocked remains in scope but not fully preventable.
- **Malicious partner:** easy revocation prevents future sharing. No remote erasure, screenshot prevention, coercion detection, or control over already received content is claimed.
- **Dependency compromise:** minimal dependencies, lockfile, review, audit, CSP, and release checks.
- **Quota exhaustion:** safe error handling and small bounded documents; robust global throttling requires trusted infrastructure.
- **Hosting compromise:** signed repository workflow permissions are minimal, deployment is environment-gated, and no secrets belong in built assets.

## Production migration

Before public production: adopt an independently reviewed end-to-end protocol; use trusted transactional pairing and rate limiting; enforce one active relationship server-side; implement secure key change/recovery and multi-device semantics; add automated expiry; configure response security headers; obtain security/privacy review; create incident response and abuse handling; perform accessibility and cross-browser audits; and complete data-protection legal review.

# Security policy

## Prototype status

Jivhaalaa is a small, invitation-only testing prototype. Do not use it for highly sensitive, financial, medical, or intimate information. Report suspected vulnerabilities privately to the repository owner; do not place user content, tokens, invitation codes, Firebase identifiers, or exploit details in a public issue.

## Security boundaries

The static client cannot keep an administrator secret or establish trusted server authority. Firebase Authentication establishes the cloud UID. Firestore Rules are the authorization boundary for cloud documents. App Check, when enabled, is an abuse-reduction signal rather than user authorization. Browser cryptography protects envelope content before upload, but this prototype protocol has not received independent cryptographic review.

A hostile modified client or multiple accounts may evade client-driven pairing attempts and may stress free-tier quota. Cross-document one-partner invariants and cleanup cannot be made as strong as trusted backend orchestration. Public production use requires a reviewed protocol and trusted, rate-limited backend.

## Hosting controls

The HTML uses a CSP meta policy and no inline application scripts. GitHub Pages does not let this repository set all response headers. In particular, reliable HSTS, CSP `frame-ancestors`, Permissions Policy, cross-origin isolation, and other response-only controls cannot be guaranteed here. A production migration should use hosting where response headers are explicitly configured and tested.

## Key and local-data handling

- Device private keys and readable content never enter Firestore.
- AES-GCM nonces are random and metadata is authenticated.
- Sensitive application records are encrypted before IndexedDB writes.
- No relationship content is placed in localStorage, sessionStorage, URLs, logs, notifications, or the application-shell cache.
- Local deletion cannot remove copies already delivered to a partner or browser/OS backups.
- Device identity changes must require explicit user verification before future production sharing.

## Dependency and release practice

Run clean installation, type checking, linting, tests, production build, dependency audit, secret scan, and attribution scan before release. Review dependency advisories rather than applying breaking automated upgrades without testing. Never commit `.env` files, service accounts, administrator credentials, OAuth secrets, private VAPID material, or messaging server keys.

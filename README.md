# Jivhaalaa · जिव्हाळा

**Feel close, even when apart.**

Jivhaalaa is a private-testing Progressive Web App for two consenting adult partners living apart. It is a static React client backed by genuine Firebase Authentication, restricted Cloud Firestore metadata, encrypted local IndexedDB storage, and browser cryptography. It is **not ready for public or highly sensitive use**.

## What is implemented

- Mobile-first installable application shell with offline caching, five-section navigation, light/dark themes, and reduced-motion support.
- English, Hindi, Marathi, Kannada, and Tamil resource dictionaries with system-language detection and an in-app selector.
- Genuine Google sign-in with popup, redirect fallback, session restoration, sign-out, and account deletion entry points. Missing configuration fails closed.
- Locally encrypted memories and emotion history in IndexedDB; private content is not stored in Web Storage or service-worker caches.
- Web Crypto ECDH P-256 key agreement primitives, AES-256-GCM authenticated envelopes, bound metadata, random nonces, safety-number derivation, and replay-ID persistence.
- Ten-minute, high-entropy pairing invitations; SHA-256 identifiers; transactional redemption, cancellation, revocation, and prototype per-user lockout.
- Restrictive Firestore Rules and Emulator Suite tests.
- GitHub Pages build/deployment workflow gated by all quality checks.

Encrypted cloud messaging UI remains intentionally disabled until both partners have exchanged and verified real device public keys. Background push delivery is not included because a static site has no trusted sender.

## Local development

Requirements: Node.js 20.19 or newer and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Without Firebase values the app starts safely in a configuration-missing state and cannot authenticate. Do not put private keys, OAuth client secrets, service accounts, server messaging keys, or administrator credentials in any `VITE_` variable.

Quality commands:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:rules
```

The Rules test requires Java and the Firebase CLI; its script starts and stops the Firestore emulator automatically.

## Firebase Spark setup

1. Create a Firebase project and keep it on the Spark plan. Do not add billing.
2. Add a Web app. Copy its public web identifiers into repository/environment variables listed in `.env.example`.
3. In Authentication, enable only the Google provider needed for this test.
4. Add `localhost` and the exact `OWNER.github.io` Pages hostname to Authentication → Settings → Authorized domains. With a custom domain, add that exact hostname later.
5. Create Cloud Firestore in locked/production mode. Never use test mode.
6. Review and deploy `firestore.rules` and `firestore.indexes.json` using the Firebase CLI from a trusted administrator workstation.
7. Optionally register the Pages web app with App Check using reCAPTCHA Enterprise, add the public site key as `VITE_RECAPTCHA_SITE_KEY`, verify token metrics, then enable enforcement for Firestore. App Check reduces casual abuse but is not authorization.
8. Invite only the intended 2–10 couples. Ask testers not to share highly sensitive, financial, medical, or intimate information.

Spark quotas can change; review the Firebase console’s current quota page before testing. The UI maps permission, network, expired-session, and quota errors to privacy-safe messages.

## GitHub Pages

1. Add the six required `VITE_FIREBASE_*` values and optional App Check site key as GitHub Actions repository variables, then map them into the build job if this test deployment needs live Firebase. They are public web configuration, not administrator secrets.
2. In Settings → Pages, choose **GitHub Actions** as the source.
3. Configure the `github-pages` environment with required reviewer approval before allowing a deployment.
4. Merge to `main` only after approval. The workflow installs from the lockfile, typechecks, lints, tests, builds, uploads only `dist`, and then deploys.

Vite derives a project-site base from `GITHUB_REPOSITORY`; user/organization Pages repositories ending in `.github.io` use `/`. `HashRouter` keeps direct navigation and refreshes within the static host. For a later custom domain, set the repository Pages domain and validate the base behavior before rollout.

## Test data deletion and account removal

- **Delete local data** removes the local vault, cryptographic records, and replay IDs on the current browser; language preference remains.
- **Revoke connection** changes cloud relationship state and stops future envelopes when Rules are deployed. It cannot erase content already received on another device.
- **Delete account** invokes Firebase Authentication deletion. Firebase may require a recent Google sign-in. Cloud profile cleanup should be completed before authentication deletion; a production service must make that lifecycle atomic.
- A test administrator should remove expired invitations, revoked metadata, and expired envelopes from the Firebase console after a test cycle. Automatic server-side retention is unavailable in this architecture.

## Browser and platform limitations

Current Safari, Chrome, and Firefox support the selected P-256 ECDH and AES-GCM Web Crypto primitives. Browser private mode, storage eviction, device loss, clearing site data, and some OS backup systems can destroy or expose local data outside application control. Installation and storage persistence vary by browser. Foreground Firestore updates are possible while open; secure background push sending is not included. See [SECURITY.md](SECURITY.md), [PRIVACY_ARCHITECTURE.md](PRIVACY_ARCHITECTURE.md), and [THREAT_MODEL.md](THREAT_MODEL.md).

## Implementation status and deferred work

The foundation, genuine authentication boundary, encrypted local repository, cryptographic envelope primitives, invitation mechanics, restrictive Rules, responsive PWA shell, localization base, local text memories, and deployment pipeline are present. The following remain deliberately deferred rather than simulated:

- Cloud sharing of messages, emotions, responses, signals, and ritual answers until device registration, mutual confirmation, identity-change warnings, and verified relationship-key lifecycle are connected end to end.
- Full application-lock UI until key wrapping, inactivity, wrong-passphrase handling, recovery, and memory clearing are browser-tested.
- Photo memories until MIME/size validation, encrypted blob storage, quota handling, and eviction tests are complete.
- Push notifications, because this architecture has no trusted notification sender.
- Automatic cloud retention cleanup, server-authoritative brute-force defense, multi-account abuse controls, and atomic account deletion, all of which need trusted execution.
- Playwright browser coverage until browser binaries and a stable Firebase emulator test environment are available.

No deferred control is represented as a successful operation in the interface.

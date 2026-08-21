export const firebaseEnvironment = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
}
const required = ['apiKey', 'authDomain', 'projectId', 'messagingSenderId', 'appId'] as const
export const missingFirebaseFields = required.filter((key) => !firebaseEnvironment[key]?.trim())
export const isFirebaseConfigured = missingFirebaseFields.length === 0

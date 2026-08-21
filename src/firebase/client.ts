import { initializeApp, type FirebaseApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { firebaseEnvironment, isFirebaseConfigured } from './config'
let services: { app: FirebaseApp; auth: Auth; db: Firestore } | null = null
export function getFirebase() {
  if (!isFirebaseConfigured) return null
  if (services) return services
  const app = initializeApp(firebaseEnvironment)
  if (firebaseEnvironment.recaptchaSiteKey && typeof window !== 'undefined') {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(firebaseEnvironment.recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true,
    })
  }
  services = { app, auth: getAuth(app), db: getFirestore(app) }
  return services
}

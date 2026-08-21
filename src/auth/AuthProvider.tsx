import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  GoogleAuthProvider,
  deleteUser,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { getFirebase } from '../firebase/client'
import { safeFirebaseError, type SafeError } from '../firebase/errors'
type AuthState = {
  user: User | null
  loading: boolean
  error: SafeError | null
  configured: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
}
const Context = createContext<AuthState | null>(null)
function redirectPreferred() {
  return (
    /iP(ad|hone|od)/.test(navigator.userAgent) ||
    (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent))
  )
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const service = getFirebase()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(Boolean(service))
  const [error, setError] = useState<SafeError | null>(null)
  useEffect(() => {
    if (!service) return
    void getRedirectResult(service.auth).catch((cause) => setError(safeFirebaseError(cause)))
    return onAuthStateChanged(
      service.auth,
      (next) => {
        setUser(next)
        setLoading(false)
      },
      (cause) => {
        setError(safeFirebaseError(cause))
        setLoading(false)
      },
    )
  }, [service])
  const signIn = async () => {
    if (!service) return
    setError(null)
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    try {
      if (redirectPreferred()) await signInWithRedirect(service.auth, provider)
      else await signInWithPopup(service.auth, provider)
    } catch (cause) {
      const safe = safeFirebaseError(cause)
      if (safe === 'unknown') await signInWithRedirect(service.auth, provider)
      else setError(safe)
    }
  }
  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      error,
      configured: Boolean(service),
      signIn,
      signOut: async () => {
        if (service) await firebaseSignOut(service.auth)
      },
      deleteAccount: async () => {
        if (user) await deleteUser(user)
      },
    }),
    [user, loading, error, service],
  )
  return <Context.Provider value={value}>{children}</Context.Provider>
}
export function useAuth() {
  const value = useContext(Context)
  if (!value) throw new Error('Missing authentication provider')
  return value
}

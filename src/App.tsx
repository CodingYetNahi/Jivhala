import { useEffect, useState } from 'react'
import { useAuth } from './auth/AuthProvider'
import { useI18n } from './i18n/I18nProvider'
import { Onboarding } from './app/Onboarding'
import { AppShell } from './app/AppShell'
export default function App() {
  const auth = useAuth()
  const { t } = useI18n()
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true),
      off = () => setOnline(false)
    addEventListener('online', on)
    addEventListener('offline', off)
    return () => {
      removeEventListener('online', on)
      removeEventListener('offline', off)
    }
  }, [])
  if (auth.loading)
    return (
      <main id="main" className="center">
        <div className="loader" />
        <p role="status">{t('loading')}</p>
      </main>
    )
  return (
    <>
      {!online && (
        <div className="offline-banner" role="status">
          {t('offline')}
        </div>
      )}
      {auth.user ? <AppShell /> : <Onboarding />}
    </>
  )
}

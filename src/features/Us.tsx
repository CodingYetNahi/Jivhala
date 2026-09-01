import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { clearPrivateData, storageEstimate } from '../data/localRepository'
import { revokeRelationship } from '../pairing/repository'
import { useI18n } from '../i18n/I18nProvider'
import { locales } from '../i18n/resources'
const localeNames = { en: 'English', hi: 'हिन्दी', mr: 'मराठी', kn: 'ಕನ್ನಡ', ta: 'தமிழ்' }
export function Us({
  relationshipId,
  onRefresh,
}: {
  relationshipId: string | null
  onRefresh: () => void
}) {
  const { t, locale, setLocale } = useI18n()
  const auth = useAuth()
  const [usage, setUsage] = useState<string>('')
  const estimate = async () => {
    const value = await storageEstimate()
    setUsage(value.usage ? `${(value.usage / 1024 / 1024).toFixed(1)} MB` : '—')
  }
  const deleteLocal = async () => {
    if (confirm(t('deleteConfirm'))) {
      if (!auth.user) return
      await clearPrivateData(auth.user.uid)
      location.reload()
    }
  }
  const revoke = async () => {
    if (auth.user && relationshipId && confirm(t('revokeConfirm'))) {
      await revokeRelationship(auth.user.uid, relationshipId)
      onRefresh()
    }
  }
  return (
    <>
      <header>
        <p className="eyebrow">{t('testLimit')}</p>
        <h1>{t('settings')}</h1>
      </header>
      <section className="settings-list">
        <label className="setting">
          <span>
            <strong>{t('language')}</strong>
            <small>{localeNames[locale]}</small>
          </span>
          <select
            aria-label={t('language')}
            value={locale}
            onChange={(event) => setLocale(event.target.value as typeof locale)}
          >
            {locales.map((item) => (
              <option key={item} value={item}>
                {localeNames[item]}
              </option>
            ))}
          </select>
        </label>
        <div className="setting">
          <span>
            <strong>{t('notifications')}</strong>
            <small>{t('privacyBrief')}</small>
          </span>
        </div>
        <div className="setting">
          <span>
            <strong>{t('storage')}</strong>
            <small>{usage || t('localOnly')}</small>
          </span>
          <button className="text-button" onClick={() => void estimate()}>
            {t('storage')}
          </button>
        </div>
        <button className="setting danger" onClick={() => void deleteLocal()}>
          <span>
            <strong>{t('deleteLocal')}</strong>
            <small>{t('localOnly')}</small>
          </span>
        </button>
        {relationshipId && (
          <button className="setting danger" onClick={() => void revoke()}>
            <span>
              <strong>{t('revoke')}</strong>
              <small>{t('revokeWarning')}</small>
            </span>
          </button>
        )}
        <button className="setting" onClick={() => void auth.signOut()}>
          <span>
            <strong>{t('signOut')}</strong>
          </span>
        </button>
        <button
          className="setting danger"
          onClick={() => {
            if (confirm(t('accountConfirm'))) void auth.deleteAccount()
          }}
        >
          <span>
            <strong>{t('deleteAccount')}</strong>
          </span>
        </button>
      </section>
    </>
  )
}

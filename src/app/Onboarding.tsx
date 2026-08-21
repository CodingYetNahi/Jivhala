import { useState } from 'react'
import { Brand } from '../components/Brand'
import { useAuth } from '../auth/AuthProvider'
import { useI18n } from '../i18n/I18nProvider'
import { locales } from '../i18n/resources'
const localeNames = { en: 'English', hi: 'हिन्दी', mr: 'मराठी', kn: 'ಕನ್ನಡ', ta: 'தமிழ்' }
export function Onboarding() {
  const { t, locale, setLocale } = useI18n()
  const auth = useAuth()
  const [accepted, setAccepted] = useState(false)
  return (
    <main id="main" className="onboarding">
      <div className="onboard-art" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <Brand />
      <p className="eyebrow">{t('tagline')}</p>
      <h1>{t('welcome')}</h1>
      <p className="lead">{t('positioning')}</p>
      <section className="notice">
        <strong>{t('testLimit')}</strong>
        <p>{t('privateTest')}</p>
      </section>
      <label className="field">
        <span>{t('chooseLanguage')}</span>
        <select value={locale} onChange={(event) => setLocale(event.target.value as typeof locale)}>
          {locales.map((item) => (
            <option key={item} value={item}>
              {localeNames[item]}
            </option>
          ))}
        </select>
      </label>
      <div className="privacy-card">
        <span className="privacy-icon" aria-hidden="true">
          ⌾
        </span>
        <p>{t('privacyBrief')}</p>
      </div>
      {!accepted ? (
        <button className="primary" onClick={() => setAccepted(true)}>
          {t('agree')}
        </button>
      ) : auth.configured ? (
        <>
          <button className="google-button" onClick={() => void auth.signIn()}>
            <span aria-hidden="true">G</span>
            {t('continueGoogle')}
          </button>
          {auth.error && (
            <p className="form-error" role="alert">
              {auth.error === 'cancelled' ? t('authCancelled') : t('authFailed')}
            </p>
          )}
        </>
      ) : (
        <div className="config-error" role="alert">
          {t('notConfigured')}
        </div>
      )}
    </main>
  )
}

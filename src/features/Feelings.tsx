import { useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { savePrivateRecord } from '../crypto/vault'
import { emotionalContent } from '../i18n/emotionalContent'
import { useAuth } from '../auth/AuthProvider'
export function Feelings({ paired }: { paired: boolean }) {
  const { t, locale } = useI18n()
  const { user } = useAuth()
  const { emotions, needs } = emotionalContent[locale]
  const [emotion, setEmotion] = useState('')
  const [need, setNeed] = useState('')
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const submit = async () => {
    if (!paired) return
    if (!user) return
    await savePrivateRecord(user.uid, 'emotion', {
      emotion,
      need,
      note,
      intensity: 3,
      createdAt: Date.now(),
    })
    setSaved(true)
    setNote('')
  }
  return (
    <>
      <header>
        <p className="eyebrow">{t('weekly')}</p>
        <h1>{t('emotionTitle')}</h1>
      </header>
      <div className="choice-grid">
        {emotions.map((item) => (
          <button
            className={emotion === item ? 'choice selected' : 'choice'}
            aria-pressed={emotion === item}
            key={item}
            onClick={() => setEmotion(item)}
          >
            <span aria-hidden="true">●</span>
            {item}
          </button>
        ))}
      </div>
      <label className="field">
        <span>{t('supportTitle')}</span>
        <select value={need} onChange={(event) => setNeed(event.target.value)}>
          <option value="">—</option>
          {needs.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>{t('note')}</span>
        <textarea maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} />
      </label>
      <button className="primary" disabled={!emotion || !paired} onClick={() => void submit()}>
        {t('saveLocal')}
      </button>
      {!paired && <p className="hint">{t('noPartner')}</p>}
      {saved && <p role="status">{t('localOnly')}</p>}
    </>
  )
}

import { useEffect, useState } from 'react'
import { decryptPrivateRecord, savePrivateRecord } from '../crypto/vault'
import { listVault } from '../data/localRepository'
import { useI18n } from '../i18n/I18nProvider'
type Memory = { text: string; createdAt: number }
export function Memories() {
  const { t, locale } = useI18n()
  const [text, setText] = useState('')
  const [memories, setMemories] = useState<(Memory & { id: string })[]>([])
  const load = () =>
    void listVault('memory').then(async (items) =>
      setMemories(
        await Promise.all(
          items.map(async (item) => ({
            ...(await decryptPrivateRecord<Memory>(item)),
            id: item.id,
          })),
        ),
      ),
    )
  useEffect(load, [])
  const save = async () => {
    if (!text.trim()) return
    await savePrivateRecord('memory', { text: text.trim(), createdAt: Date.now() })
    setText('')
    load()
  }
  return (
    <>
      <header>
        <p className="eyebrow">{t('localOnly')}</p>
        <h1>{t('memoryTitle')}</h1>
      </header>
      <section className="card">
        <label className="field">
          <span>{t('memoryPlaceholder')}</span>
          <textarea
            maxLength={2000}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </label>
        <button className="primary" disabled={!text.trim()} onClick={() => void save()}>
          {t('saveLocal')}
        </button>
      </section>
      {memories.length === 0 ? (
        <p className="empty">{t('noMemories')}</p>
      ) : (
        <ul className="memory-list">
          {memories.map((item) => (
            <li key={item.id}>
              <p>{item.text}</p>
              <time dateTime={new Date(item.createdAt).toISOString()}>
                {new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(item.createdAt)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

import { useState } from 'react'
import { createInvitation, cancelInvitation, redeemInvitation } from '../pairing/repository'
import { useAuth } from '../auth/AuthProvider'
import { useI18n } from '../i18n/I18nProvider'
type Invite = { code: string; hash: string; expiresAt: number }
export function Home({
  relationshipId,
  onRefresh,
}: {
  relationshipId: string | null
  onRefresh: () => void
}) {
  const { user } = useAuth()
  const { t } = useI18n()
  const [invite, setInvite] = useState<Invite | null>(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (relationshipId)
    return (
      <>
        <header className="hero">
          <p className="eyebrow">{t('encryptedNotice')}</p>
          <h1>{t('paired')}</h1>
          <div className="orbital" aria-hidden="true">
            <i />
            <i />
            <b />
          </div>
        </header>
        <section className="card">
          <h2>{t('countdown')}</h2>
          <p>{t('empty')}</p>
        </section>
      </>
    )
  const create = async () => {
    if (!user) return
    setBusy(true)
    setError('')
    try {
      setInvite(await createInvitation(user.uid))
    } catch {
      setError(t('error'))
    } finally {
      setBusy(false)
    }
  }
  const redeem = async () => {
    if (!user) return
    setBusy(true)
    setError('')
    try {
      await redeemInvitation(user.uid, code)
      onRefresh()
    } catch (cause) {
      setError(
        cause instanceof Error && cause.message === 'pairing-locked'
          ? t('lockout')
          : t('genericPairError'),
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <header>
        <p className="eyebrow">{t('localOnly')}</p>
        <h1>{t('unpaired')}</h1>
        <p>{t('unpairedBody')}</p>
      </header>
      {invite ? (
        <section className="invite-card">
          <h2>{t('invitation')}</h2>
          <output className="invite-code" aria-label={t('pairingCode')}>
            {invite.code}
          </output>
          <p>{t('expires')}</p>
          <button
            className="secondary"
            onClick={() => {
              if (user) void cancelInvitation(user.uid, invite.hash).then(() => setInvite(null))
            }}
          >
            {t('cancel')}
          </button>
          <button className="secondary" onClick={onRefresh}>
            {t('confirm')}
          </button>
        </section>
      ) : (
        <button className="primary" disabled={busy} onClick={() => void create()}>
          {t('createInvite')}
        </button>
      )}
      <div className="divider">
        <span>{t('enterInvite')}</span>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void redeem()
        }}
      >
        <label className="field">
          <span>{t('pairingCode')}</span>
          <input
            autoComplete="off"
            spellCheck="false"
            value={code}
            maxLength={47}
            onChange={(event) => setCode(event.target.value)}
          />
        </label>
        <button className="secondary" disabled={busy || code.length < 20}>
          {t('confirm')}
        </button>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </>
  )
}

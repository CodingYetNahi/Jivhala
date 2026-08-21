import { useEffect, useState } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { useAuth } from '../auth/AuthProvider'
import { useI18n } from '../i18n/I18nProvider'
import { relationshipFor, ensureUserProfile } from '../pairing/repository'
import { Home } from '../features/Home'
import { Feelings } from '../features/Feelings'
import { Connect } from '../features/Connect'
import { Memories } from '../features/Memories'
import { Us } from '../features/Us'
const nav = [
  ['/', 'home', '⌂'],
  ['/feelings', 'feelings', '◌'],
  ['/connect', 'connect', '◎'],
  ['/memories', 'memories', '◇'],
  ['/us', 'us', '○'],
] as const
export function AppShell() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [relationshipId, setRelationshipId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const refresh = () => {
    if (!user) return
    void relationshipFor(user.uid)
      .then(setRelationshipId)
      .finally(() => setLoading(false))
  }
  useEffect(() => {
    if (user) void ensureUserProfile(user.uid).then(refresh)
  }, [user])
  if (loading)
    return (
      <main id="main">
        <p role="status">{t('loading')}</p>
      </main>
    )
  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        {t('skip')}
      </a>
      <aside>
        <Brand />
        <nav aria-label="Primary">
          {nav.map(([path, key, icon]) => (
            <NavLink key={path} end={path === '/'} to={path}>
              <span aria-hidden="true">{icon}</span>
              {t(key)}
            </NavLink>
          ))}
        </nav>
        <div className="privacy-pill">⌾ {t('localOnly')}</div>
      </aside>
      <main id="main" className="content">
        <Routes>
          <Route path="/" element={<Home relationshipId={relationshipId} onRefresh={refresh} />} />
          <Route path="/feelings" element={<Feelings paired={Boolean(relationshipId)} />} />
          <Route path="/connect" element={<Connect paired={Boolean(relationshipId)} />} />
          <Route path="/memories" element={<Memories />} />
          <Route path="/us" element={<Us relationshipId={relationshipId} onRefresh={refresh} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <nav className="bottom-nav" aria-label="Primary">
        {nav.map(([path, key, icon]) => (
          <NavLink key={path} end={path === '/'} to={path}>
            <span aria-hidden="true">{icon}</span>
            <small>{t(key)}</small>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

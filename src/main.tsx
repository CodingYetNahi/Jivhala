import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './auth/AuthProvider'
import { I18nProvider } from './i18n/I18nProvider'
import './styles/global.css'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <AuthProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </AuthProvider>
    </I18nProvider>
  </StrictMode>,
)
if ('serviceWorker' in navigator)
  window.addEventListener(
    'load',
    () => void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`),
  )

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getPreference, setPreference } from '../data/localRepository'
import { locales, resources, type Locale, type TextKey } from './resources'
type I18n = { locale: Locale; setLocale: (locale: Locale) => void; t: (key: TextKey) => string }
const Context = createContext<I18n | null>(null)
function detected(): Locale {
  const language = navigator.language.slice(0, 2)
  return locales.includes(language as Locale) ? (language as Locale) : 'en'
}
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detected)
  useEffect(() => {
    void getPreference('locale').then((saved) => {
      if (saved && locales.includes(saved as Locale)) setLocaleState(saved as Locale)
    })
  }, [])
  const setLocale = (next: Locale) => {
    setLocaleState(next)
    document.documentElement.lang = next
    void setPreference('locale', next)
  }
  const value = useMemo(
    () => ({ locale, setLocale, t: (key: TextKey) => resources[locale][key] }),
    [locale],
  )
  return <Context.Provider value={value}>{children}</Context.Provider>
}
export function useI18n() {
  const value = useContext(Context)
  if (!value) throw new Error('Missing language provider')
  return value
}

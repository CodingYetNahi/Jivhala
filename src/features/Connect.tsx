import { useI18n } from '../i18n/I18nProvider'
import { StateNotice } from '../components/StateNotice'
export function Connect({ paired }: { paired: boolean }) {
  const { t } = useI18n()
  return (
    <>
      <header>
        <p className="eyebrow">{t('encryptedNotice')}</p>
        <h1>{t('connect')}</h1>
      </header>
      <StateNotice title={paired ? t('empty') : t('noPartner')}>
        <span>{paired ? t('notifications') : t('unpairedBody')}</span>
      </StateNotice>
    </>
  )
}

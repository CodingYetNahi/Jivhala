import { useI18n } from '../i18n/I18nProvider'
export function Brand() {
  const { t } = useI18n()
  return (
    <div className="brand" aria-label={`${t('appName')} ${t('marathiName')}`}>
      <span className="brand-mark" aria-hidden="true">
        <i />
        <i />
      </span>
      <span>
        <strong>{t('appName')}</strong>
        <small>{t('marathiName')}</small>
      </span>
    </div>
  )
}

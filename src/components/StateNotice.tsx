import type { ReactNode } from 'react'
export function StateNotice({
  title,
  children,
  action,
}: {
  title: string
  children?: ReactNode
  action?: ReactNode
}) {
  return (
    <section className="state-notice" role="status">
      <div className="state-symbol" aria-hidden="true">
        ◌
      </div>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {action}
    </section>
  )
}

import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'

export function AppShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const { user, signOut } = useAuth()
  return <div className="app-shell">
    <header className="topbar">
      <Link className="brand" to="/"><span className="brand-mark">SG</span><span>Session Game</span></Link>
      <div className="topbar-copy"><strong>{title}</strong>{subtitle ? <small>{subtitle}</small> : null}</div>
      <div className="account-block"><span>{user?.email ?? 'Authenticated user'}</span><button className="button button-ghost" onClick={() => void signOut()}>Đăng xuất</button></div>
    </header>
    <main className="page-wrap">{children}</main>
  </div>
}

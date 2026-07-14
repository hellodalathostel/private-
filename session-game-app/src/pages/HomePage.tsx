import { useQuery } from '@tanstack/react-query'
import { Navigate, Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { LoadingState } from '../components/LoadingState'
import { StatusPill } from '../components/StatusPill'
import { api } from '../lib/rpc'
import { queryKeys } from '../lib/queryKeys'

export function HomePage() {
  const bootstrap = useQuery({ queryKey: queryKeys.bootstrap, queryFn: api.getBootstrap })
  if (bootstrap.isLoading) return <LoadingState label="Đang tải session directory…" />
  if (bootstrap.error) return <div className="center-state error-state">Không thể tải bootstrap: {bootstrap.error.message}</div>
  if (!bootstrap.data) return null
  if (bootstrap.data.sessions.length === 1 && bootstrap.data.default_route !== '/') return <Navigate to={bootstrap.data.default_route} replace />

  return <AppShell title="Session Directory" subtitle="Chọn vai trò và session cần mở">
    <section className="hero-panel"><div><span className="eyebrow">Authenticated workspace</span><h1>{bootstrap.data.user.display_name ?? bootstrap.data.user.email ?? 'Session Game'}</h1><p>{bootstrap.data.sessions.length} session có thể truy cập.</p></div></section>
    <section className="card-grid">{bootstrap.data.sessions.map((session) => {
      const route = session.session_role === 'dom' ? `/dom/${session.session_id}` : `/sub/${session.session_id}`
      return <Link className="session-card" to={route} key={`${session.session_id}:${session.session_role}`}>
        <div className="section-heading compact"><h2>{session.name}</h2><StatusPill value={session.status} /></div>
        <dl className="metric-list"><div><dt>Vai trò</dt><dd>{session.session_role}</dd></div><div><dt>Vòng</dt><dd>{session.current_round}</dd></div><div><dt>Revision</dt><dd>{session.state_revision}</dd></div><div><dt>Mode</dt><dd>{session.mode}</dd></div></dl>
        {session.recovery_required ? <p className="notice warning">Session cần recovery trước khi tiếp tục.</p> : null}
      </Link>
    })}</section>
  </AppShell>
}

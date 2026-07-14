import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Navigate, Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { LoadingState } from '../components/LoadingState'
import { StatusPill } from '../components/StatusPill'
import { api, type DemoProvisionResult } from '../lib/rpc'
import { queryKeys } from '../lib/queryKeys'

export function HomePage() {
  const bootstrap = useQuery({ queryKey: queryKeys.bootstrap, queryFn: api.getBootstrap })
  const [demoName, setDemoName] = useState('Session Game Demo v1.0')
  const [subEmail, setSubEmail] = useState('')
  const [inviteToken, setInviteToken] = useState('')
  const [provisioned, setProvisioned] = useState<DemoProvisionResult | null>(null)
  const [claimMessage, setClaimMessage] = useState<string | null>(null)

  const createDemo = useMutation({
    mutationFn: () => api.createDemoSessionWithInvite(demoName, subEmail),
    onSuccess: (result) => setProvisioned(result),
  })
  const claimInvite = useMutation({
    mutationFn: () => api.claimSessionInvite(inviteToken),
    onSuccess: async (result) => {
      setClaimMessage(`Đã liên kết participant. Session: ${result.session_id}`)
      setInviteToken('')
      await bootstrap.refetch()
    },
  })

  if (bootstrap.isLoading) return <LoadingState label="Đang tải session directory…" />
  if (bootstrap.error) return <div className="center-state error-state">Không thể tải bootstrap: {bootstrap.error.message}</div>
  if (!bootstrap.data) return null
  if (bootstrap.data.sessions.length === 1 && !provisioned && !claimMessage) return <Navigate to={bootstrap.data.default_route} replace />

  return <AppShell title="Session Directory" subtitle="Chọn vai trò và session cần mở">
    <section className="hero-panel"><div><span className="eyebrow">Authenticated workspace</span><h1>{bootstrap.data.user.display_name ?? bootstrap.data.user.email ?? 'Session Game'}</h1><p>{bootstrap.data.sessions.length} session có thể truy cập.</p></div></section>

    <section className="card-grid">
      {bootstrap.data.sessions.length === 0 ? <form className="session-card" onSubmit={(event) => { event.preventDefault(); createDemo.mutate() }}>
        <div className="section-heading compact"><h2>Tạo demo đầu tiên</h2><StatusPill value="ready" /></div>
        <p>Tạo session synthetic đã chuẩn bị sẵn, kèm một participant Sub và mã mời dùng một lần.</p>
        <label className="field-label" htmlFor="demo-name">Tên session</label>
        <input id="demo-name" value={demoName} onChange={(event) => setDemoName(event.target.value)} required />
        <label className="field-label" htmlFor="sub-email">Giới hạn email Sub</label>
        <input id="sub-email" type="email" value={subEmail} onChange={(event) => setSubEmail(event.target.value)} placeholder="Có thể để trống" />
        <button className="button button-primary full" disabled={createDemo.isPending || !demoName.trim()}>{createDemo.isPending ? 'Đang tạo…' : 'Tạo demo và mã mời'}</button>
        {createDemo.error ? <p className="notice warning">{createDemo.error.message}</p> : null}
      </form> : null}

      <form className="session-card" onSubmit={(event) => { event.preventDefault(); claimInvite.mutate() }}>
        <div className="section-heading compact"><h2>Nhận participant</h2><span>Sub</span></div>
        <p>Nhập mã mời do Dom cung cấp sau khi đăng nhập bằng đúng email được chỉ định.</p>
        <label className="field-label" htmlFor="invite-token">Invite token</label>
        <input id="invite-token" value={inviteToken} onChange={(event) => setInviteToken(event.target.value)} autoComplete="off" />
        <button className="button button-secondary full" disabled={claimInvite.isPending || !inviteToken.trim()}>{claimInvite.isPending ? 'Đang xác nhận…' : 'Claim participant'}</button>
        {claimInvite.error ? <p className="notice warning">{claimInvite.error.message}</p> : null}
        {claimMessage ? <p className="notice">{claimMessage}</p> : null}
      </form>
    </section>

    {provisioned ? <section className="panel panel-wide">
      <div className="section-heading"><h2>Demo đã tạo</h2><StatusPill value={provisioned.session_status} /></div>
      <p>Gửi mã dưới đây cho tài khoản Sub. Mã chỉ dùng một lần và hết hạn theo thời gian hiển thị.</p>
      <pre className="json-preview large">{provisioned.invite.invite_token}</pre>
      <dl className="metric-list"><div><dt>Email giới hạn</dt><dd>{provisioned.invite.email_restriction ?? 'Không giới hạn'}</dd></div><div><dt>Hết hạn</dt><dd>{new Date(provisioned.invite.expires_at).toLocaleString('vi-VN')}</dd></div></dl>
      <Link className="button button-primary" to={`/dom/${provisioned.session_id}`}>Mở Dom Control Room</Link>
    </section> : null}

    <section className="card-grid">{bootstrap.data.sessions.map((session) => {
      const route = session.session_role === 'dom' || session.session_role === 'system_admin'
        ? `/dom/${session.session_id}`
        : `/sub/${session.session_id}`
      return <Link className="session-card" to={route} key={`${session.session_id}:${session.session_role}`}>
        <div className="section-heading compact"><h2>{session.name}</h2><StatusPill value={session.status} /></div>
        <dl className="metric-list"><div><dt>Vai trò</dt><dd>{session.session_role}</dd></div><div><dt>Vòng</dt><dd>{session.current_round}</dd></div><div><dt>Revision</dt><dd>{session.state_revision}</dd></div><div><dt>Mode</dt><dd>{session.mode}</dd></div></dl>
        {session.recovery_required ? <p className="notice warning">Session cần recovery trước khi tiếp tục.</p> : null}
      </Link>
    })}</section>
  </AppShell>
}

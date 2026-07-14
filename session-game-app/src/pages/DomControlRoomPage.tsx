import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Navigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { CommandDialog } from '../components/CommandDialog'
import { LoadingState } from '../components/LoadingState'
import { SafetyOverlay } from '../components/SafetyOverlay'
import { StatusPill } from '../components/StatusPill'
import { useOperatorCommand } from '../hooks/useOperatorCommand'
import { useRealtimeSession } from '../hooks/useRealtimeSession'
import { queryKeys } from '../lib/queryKeys'
import { api } from '../lib/rpc'
import type { OperatorAction } from '../lib/types'

export function DomControlRoomPage() {
  const { sessionId } = useParams()
  if (!sessionId) return <Navigate to="/" replace />
  return <DomControlRoom sessionId={sessionId} />
}

function DomControlRoom({ sessionId }: { sessionId: string }) {
  const queryClient = useQueryClient()
  const [selectedAction, setSelectedAction] = useState<OperatorAction | null>(null)
  const [commandMessage, setCommandMessage] = useState<string | null>(null)
  const controlRoom = useQuery({ queryKey: queryKeys.dom(sessionId), queryFn: () => api.getDomControlRoom(sessionId), refetchInterval: 30_000 })
  const command = useOperatorCommand(sessionId)
  const acknowledge = useMutation({ mutationFn: (alertKey: string) => api.acknowledgeOperatorAlert(sessionId, alertKey), onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.dom(sessionId) }) })
  useRealtimeSession(sessionId, 'dom')

  const criticalAlerts = useMemo(() => controlRoom.data?.alerts.filter((alert) => !alert.acknowledged) ?? [], [controlRoom.data])
  if (controlRoom.isLoading) return <LoadingState label="Đang mở Dom Control Room…" />
  if (controlRoom.error) return <div className="center-state error-state">Không thể mở Control Room: {controlRoom.error.message}</div>
  const data = controlRoom.data
  if (!data) return null
  const currentRevision = data.session.state_revision

  async function runCommand(payload: Record<string, unknown>) {
    if (!selectedAction) return
    const response = await command.mutateAsync({ commandType: selectedAction.code, expectedRevision: currentRevision, payload })
    setSelectedAction(null)
    if (response.status === 'failed') {
      setCommandMessage(`${response.error_code ?? 'command_failed'}: ${response.error_message ?? 'Command bị từ chối.'}`)
      if (response.error_code === 'stale_revision') await controlRoom.refetch()
    } else setCommandMessage(`Đã thực thi ${selectedAction.code}. Revision mới: ${response.state_revision}.`)
  }

  return <AppShell title={data.session.name} subtitle="Dom Control Room">
    <SafetyOverlay alerts={criticalAlerts} />
    <section className="dashboard-header"><div><span className="eyebrow">Dom control room</span><h1>{data.session.name}</h1><div className="inline-meta"><StatusPill value={data.session.status} /><span>Round {data.session.current_round}</span><span>Revision {data.session.state_revision}</span><span>{data.session.mode}</span></div></div><button className="button button-secondary" onClick={() => void controlRoom.refetch()}>Refresh</button></section>
    {commandMessage ? <p className="notice">{commandMessage}</p> : null}
    <div className="dashboard-grid">
      <section className="panel panel-wide"><div className="section-heading"><h2>Available actions</h2><span>{data.available_actions.length}</span></div><div className="action-grid">{data.available_actions.map((action) => <button key={action.code} className={`action-button ${action.enabled ? '' : 'disabled'}`} disabled={!action.enabled} title={action.reason ?? undefined} onClick={() => setSelectedAction(action)}><strong>{action.code.replaceAll('_', ' ')}</strong><small>{action.reason ?? 'Sẵn sàng thực thi'}</small></button>)}</div></section>
      <section className="panel"><div className="section-heading"><h2>Participants</h2><span>{data.participants.length}</span></div><div className="stack-list">{data.participants.map((participant) => <article className="participant-row" key={participant.participant_id}><div><strong>{participant.display_name}</strong><small>{participant.role} · position {participant.board_position}</small></div><div className="numeric-block"><strong>{participant.current_submit_points}</strong><small>points</small></div><StatusPill value={participant.status} /></article>)}</div></section>
      <section className="panel"><div className="section-heading"><h2>Safety & consent alerts</h2><span>{criticalAlerts.length}</span></div><div className="stack-list scroll-panel">{criticalAlerts.length === 0 ? <p className="muted">Không có alert chưa xử lý.</p> : criticalAlerts.map((alert) => <article className={`alert-row severity-${alert.severity}`} key={alert.alert_key}><div><strong>{alert.title}</strong><small>{alert.participant_name ?? alert.source}</small></div><button className="button button-ghost" disabled={acknowledge.isPending} onClick={() => acknowledge.mutate(alert.alert_key)}>Xác nhận</button></article>)}</div></section>
      <section className="panel panel-wide"><div className="section-heading"><h2>Board economy</h2><span>{data.properties.length} purchasable spaces</span></div><div className="property-grid">{data.properties.map((property) => <article className="property-card" key={property.session_property_id}><span className="property-position">{property.position}</span><strong>{property.display_name}</strong><small>{property.color_group ?? property.space_type}</small><dl><div><dt>Owner</dt><dd>{property.owner_name ?? 'Bank'}</dd></div><div><dt>Level</dt><dd>{property.current_upgrade_level}</dd></div><div><dt>Rent</dt><dd>{property.current_rent}</dd></div><div><dt>Asset</dt><dd>{property.hidden_asset_value}</dd></div></dl></article>)}</div></section>
      <section className="panel"><div className="section-heading"><h2>Current turn</h2></div><pre className="json-preview">{JSON.stringify(data.current_turn, null, 2)}</pre></section>
      <section className="panel"><div className="section-heading"><h2>Session health</h2></div><pre className="json-preview">{JSON.stringify(data.health, null, 2)}</pre></section>
      <section className="panel panel-wide"><div className="section-heading"><h2>Recent events</h2><span>{data.recent_events.length}</span></div><div className="event-list">{data.recent_events.map((event, index) => <article key={String(event.id ?? index)}><strong>{String(event.event_type ?? 'event')}</strong><span>{event.occurred_at ? new Date(String(event.occurred_at)).toLocaleString('vi-VN') : ''}</span><code>{JSON.stringify(event.payload ?? {})}</code></article>)}</div></section>
    </div>
    <CommandDialog action={selectedAction} open={Boolean(selectedAction)} busy={command.isPending} onClose={() => setSelectedAction(null)} onSubmit={(payload) => void runCommand(payload)} />
  </AppShell>
}

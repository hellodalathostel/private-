import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Navigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { LoadingState } from '../components/LoadingState'
import { StatusPill } from '../components/StatusPill'
import { useRealtimeSession } from '../hooks/useRealtimeSession'
import { queryKeys } from '../lib/queryKeys'
import { api } from '../lib/rpc'

export function SubDashboardPage() {
  const { sessionId } = useParams()
  if (!sessionId) return <Navigate to="/" replace />
  return <SubDashboard sessionId={sessionId} />
}

function SubDashboard({ sessionId }: { sessionId: string }) {
  const queryClient = useQueryClient()
  const state = useQuery({ queryKey: queryKeys.sub(sessionId), queryFn: () => api.getMySessionState(sessionId), refetchInterval: 30_000 })
  useRealtimeSession(sessionId, 'sub')
  const safety = useMutation({
    mutationFn: (eventType: 'yellow' | 'red' | 'session_pause' | 'participation_withdrawal') => {
      const taskId = state.data?.current_visible_task?.task_instance_id
      return api.recordSafetySignal({ participantId: state.data!.self.participant_id, eventType, taskInstanceId: typeof taskId === 'string' ? taskId : null, signalText: `Submitted from Sub Dashboard: ${eventType}`, metadata: { source: 'frontend_v0.9' } })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.sub(sessionId) }),
  })
  const buyView = useMutation({ mutationFn: (taskInstanceId: string) => api.grantPrivateTaskView(taskInstanceId, state.data!.self.participant_id), onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.sub(sessionId) }) })

  if (state.isLoading) return <LoadingState label="Đang tải Sub Dashboard…" />
  if (state.error) return <div className="center-state error-state">Không thể mở Sub Dashboard: {state.error.message}</div>
  const data = state.data
  if (!data) return null

  return <AppShell title={data.session.name} subtitle={`Sub Dashboard · ${data.self.display_name}`}>
    <section className="dashboard-header"><div><span className="eyebrow">Your session state</span><h1>{data.self.display_name}</h1><div className="inline-meta"><StatusPill value={data.session.status} /><span>Round {data.session.current_round}</span><span>Position {data.self.board_position}</span>{data.self.is_in_jail ? <span>Jail turn {data.self.jail_turn_count}</span> : null}</div></div><div className="hero-number"><strong>{data.self.current_submit_points}</strong><small>Submit Points</small></div></section>
    <section className="safety-controls"><div><span className="eyebrow">Immediate safety controls</span><h2>Luôn có hiệu lực ngay</h2></div><div className="safety-buttons"><button className="button safety-yellow" disabled={safety.isPending} onClick={() => safety.mutate('yellow')}>Yellow — Pause task</button><button className="button safety-red" disabled={safety.isPending} onClick={() => safety.mutate('red')}>Red — Stop now</button><button className="button button-secondary" disabled={safety.isPending} onClick={() => safety.mutate('session_pause')}>Pause session</button><button className="button button-danger" disabled={safety.isPending} onClick={() => safety.mutate('participation_withdrawal')}>Withdraw participation</button></div></section>
    <div className="dashboard-grid">
      <section className="panel"><div className="section-heading"><h2>Participants</h2></div><div className="stack-list">{data.participants.map((participant) => <article className={`participant-row ${participant.is_current_turn ? 'current' : ''}`} key={participant.participant_id}><div><strong>{participant.display_name}</strong><small>{participant.role} · position {participant.board_position}</small></div><StatusPill value={participant.status} /></article>)}</div></section>
      <section className="panel"><div className="section-heading"><h2>Your properties</h2><span>{data.owned_properties.length}</span></div><div className="stack-list">{data.owned_properties.length === 0 ? <p className="muted">Chưa sở hữu property.</p> : data.owned_properties.map((property, index) => <article className="participant-row" key={String(property.session_property_id ?? index)}><div><strong>{String(property.display_name ?? 'Property')}</strong><small>Position {String(property.position ?? '')}</small></div><span>Level {String(property.current_upgrade_level ?? 0)}</span></article>)}</div></section>
      <section className="panel panel-wide"><div className="section-heading"><h2>Current visible task</h2></div>{data.current_visible_task ? <pre className="json-preview large">{JSON.stringify(data.current_visible_task, null, 2)}</pre> : <p className="muted">Không có task đang hiển thị.</p>}</section>
      <section className="panel"><div className="section-heading"><h2>Private viewing options</h2></div><div className="stack-list">{data.task_view_opportunities.length === 0 ? <p className="muted">Không có task đang mở quyền xem.</p> : data.task_view_opportunities.map((item, index) => <article className="view-offer" key={String(item.task_instance_id ?? index)}><div><strong>{String(item.property_name ?? 'Task')}</strong><small>{String(item.performer_name ?? '')}</small></div><div><span>{String(item.reveal_price ?? 0)} points</span><button className="button button-secondary" disabled={buyView.isPending} onClick={() => buyView.mutate(String(item.task_instance_id))}>Mua quyền xem</button></div></article>)}</div></section>
      <section className="panel"><div className="section-heading"><h2>Consent state</h2></div><div className="consent-grid">{data.current_consent.map((item, index) => <article key={String(item.category_code ?? index)}><strong>{String(item.category_name ?? item.category_code)}</strong><StatusPill value={String(item.current_state ?? 'unknown')} />{item.conditions ? <small>{String(item.conditions)}</small> : null}</article>)}</div></section>
      <section className="panel panel-wide"><div className="section-heading"><h2>Revealed board</h2></div><div className="board-strip">{data.board.map((space, index) => <article className={`board-space ${space.property_revealed ? 'revealed' : ''}`} key={String(space.board_space_id ?? index)}><span>{String(space.position ?? '')}</span><strong>{String(space.display_name ?? '')}</strong><small>{space.theme ? String(space.theme) : String(space.space_type ?? '')}</small></article>)}</div></section>
      <section className="panel panel-wide"><div className="section-heading"><h2>Recent events</h2></div><div className="event-list">{data.recent_events.map((event, index) => <article key={String(event.id ?? index)}><strong>{String(event.event_type ?? 'event')}</strong><span>{event.occurred_at ? new Date(String(event.occurred_at)).toLocaleString('vi-VN') : ''}</span><code>{JSON.stringify(event.payload ?? {})}</code></article>)}</div></section>
    </div>
  </AppShell>
}

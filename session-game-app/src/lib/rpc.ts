import { supabase } from './supabase'
import type { AppBootstrap, DomControlRoom, OperatorCommandResponse, SubSessionState } from './types'

async function rpc<T>(functionName: string, args: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.rpc(functionName, args)
  if (error) throw error
  return data as T
}

export const api = {
  getBootstrap: () => rpc<AppBootstrap>('get_frontend_bootstrap'),
  listMySessions: () => rpc<AppBootstrap['sessions']>('get_my_session_directory'),
  getDomControlRoom: (sessionId: string, recentEventLimit = 50) => rpc<DomControlRoom>('get_dom_control_room', {
    target_session_id: sessionId,
    recent_event_limit: recentEventLimit,
  }),
  getMySessionState: (sessionId: string, recentEventLimit = 40) => rpc<SubSessionState>('get_my_session_state', {
    target_session_id: sessionId,
    recent_event_limit: recentEventLimit,
  }),
  executeOperatorCommand: (input: { sessionId: string; idempotencyKey: string; expectedRevision: number; commandType: string; payload: Record<string, unknown> }) => rpc<OperatorCommandResponse>('execute_operator_command', {
    target_session_id: input.sessionId,
    target_idempotency_key: input.idempotencyKey,
    target_expected_revision: input.expectedRevision,
    target_command_type: input.commandType,
    target_payload: input.payload,
  }),
  acknowledgeOperatorAlert: (sessionId: string, alertKey: string, notes?: string) => rpc<Record<string, unknown>>('acknowledge_operator_alert', {
    target_session_id: sessionId,
    target_alert_key: alertKey,
    target_notes: notes ?? null,
  }),
  recordSafetySignal: (input: { participantId: string; eventType: 'yellow' | 'red' | 'session_pause' | 'participation_withdrawal'; taskInstanceId?: string | null; signalText?: string | null; metadata?: Record<string, unknown> }) => rpc<string>('record_safety_signal', {
    target_participant_id: input.participantId,
    target_event_type: input.eventType,
    target_task_instance_id: input.taskInstanceId ?? null,
    target_signal_text: input.signalText ?? null,
    target_metadata: input.metadata ?? {},
  }),
  grantPrivateTaskView: (taskInstanceId: string, viewerParticipantId: string) => rpc<string>('grant_task_view_access', {
    target_task_instance_id: taskInstanceId,
    target_viewer_participant_id: viewerParticipantId,
    make_public: false,
  }),
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type SessionRole = 'dom' | 'sub' | 'observer' | 'system_admin'
export type SessionStatus = 'setup' | 'consent_review' | 'ready' | 'running' | 'paused' | 'ended' | 'cancelled'

export interface SessionDirectoryItem {
  session_id: string
  name: string
  status: SessionStatus
  mode: 'demo' | 'production'
  is_synthetic: boolean
  session_role: SessionRole
  participant_id: string | null
  participant_display_name: string | null
  participant_status: string | null
  current_round: number
  state_revision: number
  recovery_required: boolean
  is_current_turn: boolean
  scheduled_start_at: string | null
  started_at: string | null
  paused_at: string | null
  ended_at: string | null
  updated_at: string
}

export interface AppBootstrap {
  user: { id: string; email: string | null; display_name: string | null; timezone: string }
  app_roles: string[]
  sessions: SessionDirectoryItem[]
  default_session_id: string | null
  default_route: string
  generated_at: string
}

export interface OperatorAction {
  code: string
  enabled: boolean
  reason: string | null
  required_payload: Record<string, Json>
  target: Record<string, Json>
}

export interface OperatorAlert {
  alert_key: string
  source: string
  title: string
  severity: 'info' | 'warning' | 'critical'
  details?: string | null
  occurred_at: string
  participant_id?: string | null
  participant_name?: string | null
  acknowledged: boolean
  [key: string]: Json | undefined
}

export interface OperatorCommandResponse {
  status: 'succeeded' | 'failed'
  command_id: string
  command_type?: string
  starting_revision?: number
  state_revision: number
  result?: Json
  error_code?: string
  error_message?: string
  error_detail?: string | null
  replayed: boolean
}

export interface DomParticipant {
  participant_id: string
  display_name: string
  role: SessionRole
  status: string
  turn_order: number | null
  current_submit_points: number
  board_position: number
  is_in_jail: boolean
  jail_turn_count: number
  outstanding_debt: number
  property_count: number
  hidden_asset_value: number
  net_worth: number
  final_rank: number | null
  account_connected: boolean
}

export interface DomProperty {
  session_property_id: string
  display_name: string
  position: number
  space_type: string
  color_group: string | null
  owner_participant_id: string | null
  owner_name: string | null
  ownership_status: string
  current_upgrade_level: number
  land_price: number
  current_rent: number
  hidden_asset_value: number
  theme: string | null
  theme_revealed: boolean
  available_for_purchase: boolean
}

export interface DomControlRoom {
  session: {
    session_id: string
    name: string
    status: SessionStatus
    mode: string
    state_revision: number
    current_round: number
    current_turn_id: string | null
    current_turn_participant_id: string | null
    recovery_required?: boolean
    [key: string]: Json | undefined
  }
  participants: DomParticipant[]
  properties: DomProperty[]
  alerts: OperatorAlert[]
  available_actions: OperatorAction[]
  current_turn: Record<string, Json> | null
  consent: Array<Record<string, Json>>
  health: Record<string, Json>
  recent_events: Array<Record<string, Json>>
  recent_commands: Array<Record<string, Json>>
  group_assignments: Array<Record<string, Json>>
  content_bundle: Record<string, Json> | null
  generated_at: string
}

export interface SubParticipant {
  participant_id: string
  display_name: string
  role: SessionRole
  turn_order: number | null
  status: string
  board_position: number
  is_in_jail: boolean
  jail_turn_count: number
  is_current_turn: boolean
  final_rank: number | null
}

export interface SubSessionState {
  session: {
    session_id: string
    name: string
    status: SessionStatus
    mode: string
    current_round: number
    state_revision: number
    current_turn_id: string | null
    current_turn_participant_id: string | null
    started_at: string | null
    paused_at: string | null
    ended_at: string | null
  }
  self: {
    participant_id: string
    display_name: string
    status: string
    turn_order: number
    current_submit_points: number
    board_position: number
    is_in_jail: boolean
    jail_turn_count: number
    outstanding_debt: number
    final_rank: number | null
  }
  participants: SubParticipant[]
  owned_properties: Array<Record<string, Json>>
  board: Array<Record<string, Json>>
  current_visible_task: Record<string, Json> | null
  task_view_opportunities: Array<Record<string, Json>>
  current_consent: Array<Record<string, Json>>
  held_cards: Array<Record<string, Json>>
  alerts: Array<Record<string, Json>>
  available_actions: OperatorAction[]
  recent_events: Array<Record<string, Json>>
  generated_at: string
}

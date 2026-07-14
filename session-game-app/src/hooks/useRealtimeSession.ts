import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'

type RealtimeTable = { table: string; filterColumn: 'id' | 'session_id' }

const sessionTables: RealtimeTable[] = [
  { table: 'sessions', filterColumn: 'id' },
  { table: 'session_participants', filterColumn: 'session_id' },
  { table: 'game_events', filterColumn: 'session_id' },
  { table: 'safety_events', filterColumn: 'session_id' },
  { table: 'consent_events', filterColumn: 'session_id' },
  { table: 'operator_commands', filterColumn: 'session_id' },
  { table: 'operator_alert_acknowledgements', filterColumn: 'session_id' },
  { table: 'turns', filterColumn: 'session_id' },
  { table: 'task_instances', filterColumn: 'session_id' },
  { table: 'debt_cases', filterColumn: 'session_id' },
  { table: 'session_properties', filterColumn: 'session_id' },
  { table: 'final_ranking_snapshots', filterColumn: 'session_id' },
  { table: 'final_ranking_entries', filterColumn: 'session_id' },
]

export function useRealtimeSession(sessionId: string, role: 'dom' | 'sub') {
  const queryClient = useQueryClient()
  useEffect(() => {
    const channel = supabase.channel(`session-ui:${sessionId}:${role}`)
    for (const { table, filterColumn } of sessionTables) {
      channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table,
        filter: `${filterColumn}=eq.${sessionId}`,
      }, () => {
        void queryClient.invalidateQueries({ queryKey: role === 'dom' ? queryKeys.dom(sessionId) : queryKeys.sub(sessionId) })
        void queryClient.invalidateQueries({ queryKey: queryKeys.bootstrap })
      })
    }
    channel.subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [queryClient, role, sessionId])
}

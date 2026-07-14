import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'

const sessionTables = ['sessions','session_participants','game_events','safety_events','consent_events','operator_commands','operator_alert_acknowledgements','turns','task_instances','debt_cases','session_properties'] as const

export function useRealtimeSession(sessionId: string, role: 'dom' | 'sub') {
  const queryClient = useQueryClient()
  useEffect(() => {
    const channel = supabase.channel(`session-ui:${sessionId}:${role}`)
    for (const table of sessionTables) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table, filter: `session_id=eq.${sessionId}` }, () => {
        void queryClient.invalidateQueries({ queryKey: role === 'dom' ? queryKeys.dom(sessionId) : queryKeys.sub(sessionId) })
        void queryClient.invalidateQueries({ queryKey: queryKeys.bootstrap })
      })
    }
    channel.subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [queryClient, role, sessionId])
}

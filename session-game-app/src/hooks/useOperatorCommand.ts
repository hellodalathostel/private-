import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/rpc'
import { queryKeys } from '../lib/queryKeys'

export function useOperatorCommand(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { commandType: string; expectedRevision: number; payload: Record<string, unknown> }) => api.executeOperatorCommand({
      sessionId,
      idempotencyKey: crypto.randomUUID(),
      expectedRevision: input.expectedRevision,
      commandType: input.commandType,
      payload: input.payload,
    }),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.dom(sessionId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.bootstrap }),
      ])
    },
  })
}

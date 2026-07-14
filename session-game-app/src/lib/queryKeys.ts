export const queryKeys = {
  bootstrap: ['bootstrap'] as const,
  dom: (sessionId: string) => ['dom-control-room', sessionId] as const,
  sub: (sessionId: string) => ['sub-session-state', sessionId] as const,
}

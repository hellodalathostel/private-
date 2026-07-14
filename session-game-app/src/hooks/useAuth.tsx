import type { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'

type AuthState = { session: Session | null; user: User | null; loading: boolean; signOut: () => Promise<void> }
const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let mounted = true
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })
    return () => {
      mounted = false
      data.subscription.unsubscribe()
    }
  }, [])
  const value = useMemo<AuthState>(() => ({
    session,
    user: session?.user ?? null,
    loading,
    signOut: async () => { await supabase.auth.signOut() },
  }), [session, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

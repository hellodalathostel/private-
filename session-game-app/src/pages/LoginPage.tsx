import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { hasSupabaseConfig, supabase } from '../lib/supabase'

export function LoginPage() {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  if (user) return <Navigate to="/" replace />

  async function signInWithPassword() {
    setBusy(true)
    setMessage(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setMessage(error ? error.message : 'Đăng nhập thành công.')
    setBusy(false)
  }

  async function sendMagicLink() {
    setBusy(true)
    setMessage(null)
    const redirectUrl = new URL(import.meta.env.BASE_URL, window.location.origin).toString()
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectUrl } })
    setMessage(error ? error.message : 'Đã gửi magic link. Kiểm tra email để tiếp tục.')
    setBusy(false)
  }

  return <div className="login-page"><section className="login-card">
    <span className="brand-mark large">SG</span><span className="eyebrow">Private session system</span><h1>Session Game Control</h1>
    <p>Đăng nhập bằng tài khoản đã được nối với participant trong session.</p>
    {!hasSupabaseConfig ? <div className="notice warning">Chưa cấu hình Supabase. Sao chép <code>.env.example</code> thành <code>.env.local</code> và điền publishable key.</div> : null}
    <label className="field-label" htmlFor="email">Email</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
    <label className="field-label" htmlFor="password">Mật khẩu</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
    <button className="button button-primary full" disabled={busy || !email || !password || !hasSupabaseConfig} onClick={() => void signInWithPassword()}>Đăng nhập</button>
    <button className="button button-secondary full" disabled={busy || !email || !hasSupabaseConfig} onClick={() => void sendMagicLink()}>Gửi magic link</button>
    {message ? <p className="notice">{message}</p> : null}
  </section></div>
}

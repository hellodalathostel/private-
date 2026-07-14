import { useEffect, useMemo, useState } from 'react'
import type { OperatorAction } from '../lib/types'

function defaultValue(hint: unknown): unknown {
  if (typeof hint !== 'string') return hint
  if (hint.includes('boolean')) return true
  if (hint.includes('1-6')) return 1
  if (hint.includes('bigint') || hint.includes('integer')) return 0
  if (hint.includes('json_array')) return []
  if (hint.includes('null')) return null
  return ''
}

export function CommandDialog({ action, open, busy, onClose, onSubmit }: { action: OperatorAction | null; open: boolean; busy: boolean; onClose: () => void; onSubmit: (payload: Record<string, unknown>) => void }) {
  const initialPayload = useMemo(() => {
    if (!action) return {}
    const required = Object.fromEntries(Object.entries(action.required_payload ?? {}).map(([key, hint]) => [key, defaultValue(hint)]))
    return { ...required, ...action.target }
  }, [action])
  const [text, setText] = useState('{}')
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { setText(JSON.stringify(initialPayload, null, 2)); setError(null) }, [initialPayload])
  if (!open || !action) return null
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><form className="modal-card" onSubmit={(event) => {
    event.preventDefault()
    try { const parsed = JSON.parse(text) as Record<string, unknown>; setError(null); onSubmit(parsed) } catch { setError('Payload phải là JSON hợp lệ.') }
  }}>
    <div className="section-heading"><div><span className="eyebrow">Operator command</span><h2>{action.code.replaceAll('_', ' ')}</h2></div><button type="button" className="button button-ghost" onClick={onClose}>Đóng</button></div>
    {action.reason ? <p className="notice">{action.reason}</p> : null}
    <label className="field-label" htmlFor="command-payload">Payload JSON</label>
    <textarea id="command-payload" className="code-input" value={text} onChange={(event) => setText(event.target.value)} rows={14} spellCheck={false} />
    {error ? <p className="form-error">{error}</p> : null}
    <div className="modal-actions"><button type="button" className="button button-ghost" onClick={onClose}>Hủy</button><button className="button button-primary" disabled={busy || !action.enabled}>{busy ? 'Đang thực thi…' : 'Thực thi command'}</button></div>
  </form></div>
}

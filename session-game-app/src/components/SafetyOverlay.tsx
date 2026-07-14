import { useMemo, useState } from 'react'
import type { OperatorAlert } from '../lib/types'

export function SafetyOverlay({ alerts }: { alerts: OperatorAlert[] }) {
  const [hiddenKey, setHiddenKey] = useState<string | null>(null)
  const alert = useMemo(() => alerts.find((item) => !item.acknowledged && item.severity === 'critical' && item.alert_key !== hiddenKey), [alerts, hiddenKey])
  if (!alert) return null
  return <div className="safety-overlay" role="alertdialog" aria-modal="true"><div className="safety-card">
    <span className="eyebrow">Safety priority</span><h2>{alert.title}</h2>
    <p>{alert.participant_name ? `${alert.participant_name}: ` : ''}{alert.details ?? 'Cần kiểm tra ngay trước khi tiếp tục.'}</p>
    <p className="muted">{new Date(alert.occurred_at).toLocaleString('vi-VN')}</p>
    <button className="button button-danger" onClick={() => setHiddenKey(alert.alert_key)}>Đã nhìn thấy — mở Control Room</button>
  </div></div>
}

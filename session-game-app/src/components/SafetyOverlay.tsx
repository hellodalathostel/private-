import { useMemo, useState } from 'react'
import type { OperatorAlert } from '../lib/types'

export function SafetyOverlay({ alerts }: { alerts: OperatorAlert[] }) {
  const criticalAlerts = useMemo(
    () => alerts.filter((item) => !item.acknowledged && item.severity === 'critical'),
    [alerts],
  )
  const alertSignature = useMemo(
    () => criticalAlerts.map((item) => item.alert_key).sort().join('|'),
    [criticalAlerts],
  )
  const [dismissedSignature, setDismissedSignature] = useState<string | null>(null)

  if (criticalAlerts.length === 0 || dismissedSignature === alertSignature) return null

  const alert = criticalAlerts[0]
  return <div className="safety-overlay" role="alertdialog" aria-modal="true"><div className="safety-card">
    <span className="eyebrow">Safety priority</span><h2>{alert.title}</h2>
    <p>{alert.participant_name ? `${alert.participant_name}: ` : ''}{alert.details ?? 'Cần kiểm tra ngay trước khi tiếp tục.'}</p>
    {criticalAlerts.length > 1 ? <p className="notice warning">Có {criticalAlerts.length} cảnh báo chưa xác nhận. Danh sách đầy đủ nằm trong Control Room.</p> : null}
    <p className="muted">{new Date(alert.occurred_at).toLocaleString('vi-VN')}</p>
    <button className="button button-danger" onClick={() => setDismissedSignature(alertSignature)}>Đã nhìn thấy — tiếp tục vào Control Room</button>
  </div></div>
}

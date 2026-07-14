export function LoadingState({ label = 'Đang tải dữ liệu…' }: { label?: string }) {
  return <div className="center-state" role="status"><div className="spinner" /><p>{label}</p></div>
}

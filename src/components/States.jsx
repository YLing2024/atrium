export function LoadingState({ label = '加载中…' }) {
  return (
    <p className="state" role="status">
      {label}
    </p>
  )
}

export function ErrorState({ onRetry }) {
  return (
    <div className="state" role="alert">
      <p>加载失败，请检查网络后重试。</p>
      {onRetry && (
        <button type="button" className="btn-retry" onClick={onRetry}>
          重试
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message = '暂无内容' }) {
  return <p className="state">{message}</p>
}

export function LoadingState({ label = 'Loading…' }) {
  return (
    <p className="state" role="status">
      {label}
    </p>
  )
}

export function ErrorState({ onRetry }) {
  return (
    <div className="state" role="alert">
      <p>Failed to load. Check your connection and try again.</p>
      {onRetry && (
        <button type="button" className="btn-retry" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message = 'Nothing here yet.' }) {
  return <p className="state">{message}</p>
}

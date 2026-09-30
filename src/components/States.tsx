interface LoadingStateProps {
  label?: string
}

interface ErrorStateProps {
  onRetry?: () => void
}

interface EmptyStateProps {
  message?: string
}

export function LoadingState({ label = 'Loading…' }: LoadingStateProps) {
  return (
    <p className="state" role="status">
      {label}
    </p>
  )
}

export function ErrorState({ onRetry }: ErrorStateProps) {
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

export function EmptyState({ message = 'Nothing here yet.' }: EmptyStateProps) {
  return <p className="state">{message}</p>
}

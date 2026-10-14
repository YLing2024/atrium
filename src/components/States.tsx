// 全站共用的异步状态占位组件。只负责语义与无障碍，不带任何视觉样式：
// 外观完全交给浏览器默认渲染（与朴素排版一致），容器宽度由 `.container` 提供。

/** LoadingState 的 props。 */
interface LoadingStateProps {
  /** 展示文案，默认 `Loading…`。 */
  label?: string
}

/** ErrorState 的 props。 */
interface ErrorStateProps {
  /** 传入后渲染重试按钮；缺省则只展示错误文案。 */
  onRetry?: () => void
}

/** EmptyState 的 props。 */
interface EmptyStateProps {
  /** 空态文案，默认 `Nothing here yet.`。 */
  message?: string
}

/**
 * 加载中占位。
 *
 * 可访问性：`role="status"` 是礼貌级 live region，读屏软件会在内容出现时播报。
 *
 * @param props.label 展示文案，默认 `Loading…`
 */
export function LoadingState({ label = 'Loading…' }: LoadingStateProps) {
  return (
    <p className="state" role="status">
      {label}
    </p>
  )
}

/**
 * 加载失败占位。
 *
 * 可访问性：`role="alert"` 为强提示级 live region，立即播报；重试按钮是原生
 * `<button>`，天然可 Tab 聚焦、可用回车/空格触发。
 *
 * @param props.onRetry 重试回调；缺省时不渲染按钮
 */
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

/**
 * 空数据占位。
 *
 * @param props.message 空态文案，默认 `Nothing here yet.`
 */
export function EmptyState({ message = 'Nothing here yet.' }: EmptyStateProps) {
  return <p className="state">{message}</p>
}

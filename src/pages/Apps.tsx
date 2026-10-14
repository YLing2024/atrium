import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchPublicApps, type PublicApp, type PublicAppsPayload } from '../api'
import { STATUS_LABEL, groupApps, latencyText, normalizeStatus } from '../appStatus'
import { LoadingState, ErrorState, EmptyState } from '../components/States'

const REFRESH_MS = 30000

/**
 * 单条应用：应用名（有对外地址则可点，新标签打开）+ 状态文字。
 * 状态一律用文字表达（正常 / 休眠 / 异常…），不再用状态点与图标。
 */
function AppRow({ app }: { app: PublicApp }) {
  const status = normalizeStatus(app.status)
  const latency = latencyText(app.latencyMs, app.status)

  return (
    <li>
      {app.url ? (
        <a href={app.url} target="_blank" rel="noopener noreferrer">
          {app.name}
        </a>
      ) : (
        app.name
      )}
      {app.desc ? ` — ${app.desc}` : null}
      {' — '}
      {STATUS_LABEL[status]}
      {latency ? ` ${latency}` : null}
    </li>
  )
}

/** 应用中心 `/apps`：同源 `GET /api/public/apps` 的纯文本列表；分组与状态逻辑保留。 */
export default function Apps() {
  const [data, setData] = useState<PublicAppsPayload | null>(null)
  const [failed, setFailed] = useState(false)
  const [loading, setLoading] = useState(false)
  const aliveRef = useRef(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const payload = await fetchPublicApps()
      if (!aliveRef.current) return
      setData(payload && typeof payload === 'object' ? payload : { categories: [], apps: [] })
      setFailed(false)
    } catch {
      // 失败保留上一次成功的数据，只在页面顶部给一行提示
      if (!aliveRef.current) return
      setFailed(true)
    } finally {
      if (aliveRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    aliveRef.current = true
    return () => {
      aliveRef.current = false
    }
  }, [])

  // 30s 自动刷新；页面隐藏时暂停，恢复可见立即刷一次。
  useEffect(() => {
    load()
    const timer = setInterval(() => {
      if (document.visibilityState !== 'hidden') load()
    }, REFRESH_MS)
    const onVisible = () => {
      if (document.visibilityState !== 'hidden') load()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [load])

  const apps = Array.isArray(data?.apps) ? data.apps : []
  const categories = Array.isArray(data?.categories) ? data.categories : []
  const groups = groupApps(categories, apps)

  return (
    <section>
      <h1>Apps</h1>
      <p>
        {data ? `${apps.length} apps` : '—'}{' '}
        <button type="button" onClick={load} disabled={loading}>
          刷新
        </button>
      </p>

      {failed && data && <p>暂时无法更新</p>}

      {!data && loading && <LoadingState />}
      {!data && !loading && failed && <ErrorState onRetry={load} />}
      {data && apps.length === 0 && <EmptyState message="暂无应用。" />}

      {groups.map((group) => (
        <section key={group.id}>
          <h2>
            {group.name} ({group.apps.length})
          </h2>
          <ul>
            {group.apps.map((app) => (
              <AppRow key={app.id} app={app} />
            ))}
          </ul>
        </section>
      ))}
    </section>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchPublicApps, type PublicApp, type PublicAppsPayload } from '../api'
import { AppIcon } from '../appIcons'
import { STATUS_LABEL, groupApps, isAbnormal, latencyText, normalizeStatus } from '../appStatus'
import { LoadingState, ErrorState, EmptyState } from '../components/States'

const REFRESH_MS = 30000

function AppCard({ app }: { app: PublicApp }) {
  const status = normalizeStatus(app.status)
  const latency = latencyText(app.latencyMs, app.status)
  const tone = isAbnormal(app.status) ? 'alert' : status === 'idle' ? 'idle' : 'ok'

  const body = (
    <>
      <span className="app-card__icon" aria-hidden="true">
        <AppIcon name={app.icon} fallback={app.name} />
      </span>
      <h3 className="app-card__name">{app.name}</h3>
      {app.desc ? <p className="app-card__desc">{app.desc}</p> : null}
      <span className="app-card__foot">
        <span className={`app-card__dot app-card__dot--${tone}`} aria-hidden="true" />
        <span className="app-card__status">{STATUS_LABEL[status]}</span>
        {latency && <span className="app-card__latency">{latency}</span>}
      </span>
    </>
  )

  // 有对外地址才可点；没有地址的基础服务是纯展示。
  if (app.url) {
    return (
      <a className="app-card" href={app.url} target="_blank" rel="noopener noreferrer">
        {body}
      </a>
    )
  }

  return <div className="app-card">{body}</div>
}

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
    <section className="page container apps">
      <header className="blog-list__head">
        <p className="kicker">Index</p>
        <h1 className="blog-list__title">Apps</h1>
        <div className="apps__meta">
          <p className="blog-list__count">{data ? `${apps.length} apps` : '—'}</p>
          <button
            type="button"
            className="apps__refresh"
            onClick={load}
            disabled={loading}
          >
            刷新
          </button>
        </div>
      </header>

      {failed && data && <p className="apps__notice">暂时无法更新</p>}

      {!data && loading && <LoadingState />}
      {!data && !loading && failed && <ErrorState onRetry={load} />}
      {data && apps.length === 0 && <EmptyState message="暂无应用。" />}

      {groups.map((group) => (
        <section className="apps__group" key={group.id}>
          <h2 className="apps__group-title">
            {group.name}
            <span className="apps__group-count">{group.apps.length}</span>
          </h2>
          <div className="apps__grid">
            {group.apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        </section>
      ))}
    </section>
  )
}

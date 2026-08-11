import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPosts } from '../api.js'
import { formatDate } from '../utils.js'
import useAsync from '../hooks/useAsync.js'
import { LoadingState, ErrorState, EmptyState } from '../components/States.jsx'

export default function BlogList() {
  const { status, data, retry } = useAsync(fetchPosts, [])
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data || []
    return (data || []).filter((post) => {
      const title = (post.title || '').toLowerCase()
      const excerpt = (post.excerpt || '').toLowerCase()
      const tags = (post.tags || []).join(' ').toLowerCase()
      return title.includes(q) || excerpt.includes(q) || tags.includes(q)
    })
  }, [data, query])

  return (
    <section className="page container blog-list">
      <header className="blog-list__head">
        <p className="kicker">博客</p>
        <h1 className="blog-list__title">文章</h1>
        <input
          className="blog-list__search"
          type="search"
          placeholder="搜索标题、摘要或标签…"
          aria-label="搜索文章"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="blog-list__head-row">
          <p className="blog-list__count">
            共 {status === 'success' ? data.length : '—'} 篇
          </p>
          <Link className="blog-list__entry" to="/blog/collections">
            合集 →
          </Link>
        </div>
      </header>

      {status === 'loading' && <LoadingState />}
      {status === 'error' && <ErrorState onRetry={retry} />}
      {status === 'success' && data.length === 0 && <EmptyState message="还没有文章" />}
      {status === 'success' && data.length > 0 && filtered.length === 0 && (
        <EmptyState message="没有找到匹配的文章" />
      )}

      {status === 'success' && filtered.length > 0 && (
        <div className="blog-list__rows">
          {filtered.map((post, i) => (
            <article className="post-row" key={post.id}>
              <time className="post-row__date" dateTime={post.created_at}>
                {formatDate(post.created_at)}
              </time>
              <span className="post-row__num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="post-row__cell">
                <Link className="post-row__main" to={`/blog/${post.slug}`}>
                  <h2 className="post-row__title">{post.title}</h2>
                  {post.excerpt && <p className="post-row__excerpt">{post.excerpt}</p>}
                </Link>
                {(post.collection || post.tags?.length > 0) && (
                  <div className="post-row__meta">
                    {post.collection && (
                      <Link
                        className="collection-badge"
                        to={`/blog/collections/${post.collection.slug}`}
                      >
                        {post.collection.name}
                      </Link>
                    )}
                    {post.tags?.length > 0 && (
                      <div className="post-row__tags">
                        {post.tags.map((tag) => (
                          <span className="tag" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

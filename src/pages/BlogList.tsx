import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPosts, type BlogPostSummary } from '../api'
import { formatDate } from '../utils'
import useAsync from '../hooks/useAsync'
import { LoadingState, ErrorState, EmptyState } from '../components/States'

// 标签数组的保守收窄：后端字段可缺省，缺省时按空数组处理
function postTags(post: { tags?: string[] | null }): string[] {
  return post.tags || []
}

export default function BlogList() {
  const { status, data, retry } = useAsync<BlogPostSummary[]>(fetchPosts, [])
  const [query, setQuery] = useState<string>('')

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
        <p className="kicker">Blog</p>
        <h1 className="blog-list__title">Writing</h1>
        <input
          className="blog-list__search"
          type="search"
          placeholder="Search by title, excerpt or tag…"
          aria-label="Search articles"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="blog-list__head-row">
          <p className="blog-list__count">
            {status === 'success' && data ? `${data.length} posts` : '—'}
          </p>
          <Link className="blog-list__entry" to="/blog/collections">
            Collections <span aria-hidden="true">→</span>
          </Link>
        </div>
      </header>

      {status === 'loading' && <LoadingState />}
      {status === 'error' && <ErrorState onRetry={retry} />}
      {status === 'success' && data && data.length === 0 && <EmptyState message="No posts yet." />}
      {status === 'success' && data && data.length > 0 && filtered.length === 0 && (
        <EmptyState message="Nothing matches your search." />
      )}

      {status === 'success' && filtered.length > 0 && (
        <div className="blog-list__rows">
          {filtered.map((post, i) => (
            <article className="post-row" key={post.id}>
              <time className="post-row__date" dateTime={post.created_at || undefined}>
                {formatDate(post.created_at)}
              </time>
              <span className="post-row__num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="post-row__cell">
                <Link className="post-row__main" to={`/blog/${post.public_id || post.slug}`}>
                  <h2 className="post-row__title">{post.title}</h2>
                  {post.excerpt && <p className="post-row__excerpt">{post.excerpt}</p>}
                </Link>
                {(post.collection || postTags(post).length > 0) && (
                  <div className="post-row__meta">
                    {post.collection && (
                      <Link
                        className="collection-badge"
                        to={`/blog/collections/${post.collection.public_id || post.collection.slug}`}
                      >
                        {post.collection.name}
                      </Link>
                    )}
                    {postTags(post).length > 0 && (
                      <div className="post-row__tags">
                        {postTags(post).map((tag) => (
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

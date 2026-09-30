import { Link } from 'react-router-dom'
import { getCollections, type BlogCollection } from '../api'
import useAsync from '../hooks/useAsync'
import { LoadingState, ErrorState, EmptyState } from '../components/States'

export default function Collections() {
  const { status, data, retry } = useAsync<BlogCollection[]>(getCollections, [])

  return (
    <section className="page container collections">
      <header className="blog-list__head">
        <p className="kicker">Blog</p>
        <h1 className="blog-list__title">Collections</h1>
        <p className="blog-list__count">
          {status === 'success' && data ? `${data.length} collections` : '—'}
        </p>
      </header>

      {status === 'loading' && <LoadingState />}
      {status === 'error' && <ErrorState onRetry={retry} />}
      {status === 'success' && data && data.length === 0 && (
        <EmptyState message="No collections yet." />
      )}

      {status === 'success' && data && data.length > 0 && (
        <div className="collections__grid">
          {data.map((collection, i) => (
            <Link
              className="collection-card"
              key={collection.id}
              to={`/blog/collections/${collection.public_id || collection.slug}`}
            >
              <span className="collection-card__num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h2 className="collection-card__name">{collection.name}</h2>
              {collection.description && (
                <p className="collection-card__desc">{collection.description}</p>
              )}
              <span className="collection-card__count">{collection.post_count} posts</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

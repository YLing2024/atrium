import { Link } from 'react-router-dom'
import { getCollections, type BlogCollection } from '../api'
import useAsync from '../hooks/useAsync'
import { LoadingState, ErrorState, EmptyState } from '../components/States'

/** 合集列表 `/blog/collections`：名称 + 链接 + 篇数，朴素列表渲染。 */
export default function Collections() {
  const { status, data, retry } = useAsync<BlogCollection[]>(getCollections, [])

  return (
    <section>
      <h1>Collections</h1>
      <p>{status === 'success' && data ? `${data.length} collections` : '—'}</p>

      {status === 'loading' && <LoadingState />}
      {status === 'error' && <ErrorState onRetry={retry} />}
      {status === 'success' && data && data.length === 0 && (
        <EmptyState message="No collections yet." />
      )}

      {status === 'success' && data && data.length > 0 && (
        <ul>
          {data.map((collection) => (
            <li key={collection.id}>
              <Link to={`/blog/collections/${collection.public_id || collection.slug}`}>
                {collection.name}
              </Link>
              <span> — {collection.post_count} posts</span>
              {collection.description && <p>{collection.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

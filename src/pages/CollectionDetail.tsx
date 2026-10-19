import { Link, useParams } from 'react-router-dom'
import { getCollection, type BlogCollectionDetail } from '../api'
import { formatDate } from '../utils'
import useAsync from '../hooks/useAsync'
import { LoadingState, ErrorState, EmptyState } from '../components/States'

// 标签数组的保守收窄：后端字段可缺省，缺省时按空数组处理
function postTags(post: { tags?: string[] | null }): string[] {
  return post.tags || []
}

export default function CollectionDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { status, data: collection, retry } = useAsync<BlogCollectionDetail | null>(
    () => getCollection(slug as string),
    [slug],
  )

  return (
    <article className="page container collection">
      {status === 'loading' && <LoadingState />}
      {status === 'error' && <ErrorState onRetry={retry} />}
      {status === 'success' && collection === null && <EmptyState message="Collection not found." />}

      {status === 'success' && collection && (
        <>
          <Link className="back-link" to="/blog/collections">
            <span aria-hidden="true">←</span> All collections
          </Link>
          <header className="post__head">
            <p className="kicker">Collection</p>
            <h1 className="post__title">{collection.name}</h1>
            {collection.description && (
              <p className="collection__desc">{collection.description}</p>
            )}
          </header>

          {collection.posts.length === 0 && <EmptyState message="No posts in this collection yet." />}

          {collection.posts.length > 0 && (
            <div className="blog-list__rows">
              {collection.posts.map((post, i) => (
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
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </article>
  )
}

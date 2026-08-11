import { useEffect, useMemo, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js/lib/common'
import { fetchPost } from '../api.js'
import { formatDate } from '../utils.js'
import useAsync from '../hooks/useAsync.js'
import { LoadingState, ErrorState, EmptyState } from '../components/States.jsx'

async function copyText(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      /* fall through to fallback */
    }
  }
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}

export default function BlogPost() {
  const { slug } = useParams()
  const bodyRef = useRef(null)
  const { status, data: post, retry } = useAsync(() => fetchPost(slug), [slug])

  const bodyHtml = useMemo(() => {
    if (!post?.content) return ''
    const raw = marked.parse(post.content)
    return DOMPurify.sanitize(typeof raw === 'string' ? raw : '')
  }, [post])

  useEffect(() => {
    const body = bodyRef.current
    if (!body) return
    body.querySelectorAll('pre code').forEach((block) => {
      const lang = (block.className.match(/language-([\w-]+)/) || [])[1]
      if (lang) block.dataset.lang = lang
      hljs.highlightElement(block)
    })

    body.querySelectorAll('pre').forEach((pre) => {
      if (pre.querySelector('.post__copy')) return
      const code = pre.querySelector('code')
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'post__copy'
      button.textContent = '复制'
      button.setAttribute('aria-label', '复制代码')
      button.addEventListener('click', async (e) => {
        e.preventDefault()
        if (!code) return
        const ok = await copyText(code.textContent || '')
        button.textContent = ok ? '已复制' : '复制失败'
        window.setTimeout(() => {
          button.textContent = '复制'
        }, 1600)
      })
      pre.classList.add('post__code-block')
      pre.appendChild(button)
    })
  }, [bodyHtml])

  return (
    <article className="page container post">
      {status === 'loading' && <LoadingState />}
      {status === 'error' && <ErrorState onRetry={retry} />}
      {status === 'success' && post === null && <EmptyState message="文章不存在或未发布" />}

      {status === 'success' && post && (
        <>
          <Link className="back-link" to="/blog">
            ← 返回文章列表
          </Link>
          <header className="post__head">
            <p className="kicker">博客文章</p>
            <h1 className="post__title">{post.title}</h1>
            <div className="post__meta">
              <time className="post-row__date" dateTime={post.created_at}>
                {formatDate(post.created_at)}
              </time>
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
          </header>
          {bodyHtml && (
            <div
              ref={bodyRef}
              className="post__body"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          )}
        </>
      )}
    </article>
  )
}

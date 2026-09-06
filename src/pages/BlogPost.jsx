import { useEffect, useMemo, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js/lib/common'
import { fetchPost } from '../api.js'
import { formatDate } from '../utils.js'
import useAsync from '../hooks/useAsync.js'
import { LoadingState, ErrorState, EmptyState } from '../components/States.jsx'

async function codeText(code) {
  const tbody = code?.querySelector('tbody')
  if (!tbody) return code?.textContent || ''
  const lines = []
  tbody.querySelectorAll('tr').forEach((row) => {
    const td = row.querySelector('.hljs-ln-code')
    if (td) lines.push(td.textContent.replace(/\n+$/, ''))
  })
  return lines.join('\n')
}

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

    body.querySelectorAll('.post__body > table').forEach((table) => {
      if (table.parentElement.classList.contains('post__table-wrap')) return
      const wrap = document.createElement('div')
      wrap.className = 'post__table-wrap'
      wrap.setAttribute('tabindex', '0')
      wrap.setAttribute('role', 'region')
      wrap.setAttribute('aria-label', 'Scrollable table')
      table.replaceWith(wrap)
      wrap.appendChild(table)
    })

    body.querySelectorAll('pre').forEach((pre) => {
      if (pre.classList.contains('post__code-block')) return
      // 包一层不滚动的 wrapper：Copy 按钮定位在 wrapper 上，横向滚动时按钮不跟着代码移动
      const wrap = document.createElement('div')
      wrap.className = 'post__code-block'
      pre.parentNode.insertBefore(wrap, pre)
      wrap.appendChild(pre)

      const code = pre.querySelector('code')
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'post__copy'
      button.textContent = 'Copy'
      button.setAttribute('aria-label', 'Copy code')
      button.addEventListener('click', async (e) => {
        e.preventDefault()
        const ok = await copyText(await codeText(code))
        button.textContent = ok ? 'Copied' : 'Copy failed'
        window.setTimeout(() => {
          button.textContent = 'Copy'
        }, 1600)
      })
      wrap.appendChild(button)
    })

    let alive = true
    window.hljs = hljs
    import('highlightjs-line-numbers.js').then(() => {
      if (!alive || !window.hljs?.lineNumbersBlockSync) return
      body.querySelectorAll('pre > code').forEach((block) => {
        if (block.querySelector('.hljs-ln')) return
        if (!block.textContent.trim() && !block.dataset.lang) return
        window.hljs.lineNumbersBlockSync(block, { singleLine: true })
      })
    })
    return () => {
      alive = false
    }
  }, [bodyHtml])

  return (
    <article className="page container post">
      {status === 'loading' && <LoadingState />}
      {status === 'error' && <ErrorState onRetry={retry} />}
      {status === 'success' && post === null && <EmptyState message="Post not found or unpublished." />}

      {status === 'success' && post && (
        <>
          <Link className="back-link" to="/blog">
            <span aria-hidden="true">←</span> All posts
          </Link>
          <header className="post__head">
            <p className="kicker">Article</p>
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

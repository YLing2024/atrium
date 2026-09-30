import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js/lib/common'
// `common` is the trimmed bundle; these four languages are not in it but ship
// as single files in the same package (no new dependency, no full `highlight.js`).
import dart from 'highlight.js/lib/languages/dart'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import nginx from 'highlight.js/lib/languages/nginx'
import protobuf from 'highlight.js/lib/languages/protobuf'
import { fetchPost, type BlogPostDetail } from '../api'
import { formatDate } from '../utils'
import useAsync from '../hooks/useAsync'
import { LoadingState, ErrorState, EmptyState } from '../components/States'

hljs.registerLanguage('dart', dart)
hljs.registerLanguage('dockerfile', dockerfile)
hljs.registerLanguage('nginx', nginx)
hljs.registerLanguage('protobuf', protobuf)

async function codeText(code: HTMLElement | null): Promise<string> {
  const tbody = code?.querySelector('tbody')
  if (!tbody) return code?.textContent || ''
  const lines: string[] = []
  tbody.querySelectorAll('tr').forEach((row) => {
    const td = row.querySelector('.hljs-ln-code')
    if (td) lines.push((td.textContent || '').replace(/\n+$/, ''))
  })
  return lines.join('\n')
}

async function copyText(text: string): Promise<boolean> {
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

// Heading text → stable DOM id for anchors and TOC jumps.
// Plain sequence (sec-0, sec-1…), not the title text: CJK titles would be
// percent-encoded into noise, and editing a title would break old deep links.
function headingId(i: number): string {
  return `sec-${i}`
}

interface TocItem {
  id: string
  depth: string
  text: string
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const bodyRef = useRef<HTMLDivElement>(null)
  const { status, data: post, retry } = useAsync<BlogPostDetail | null>(
    () => fetchPost(slug as string),
    [slug],
  )

  // Scrolled past the article head → show the sticky bar
  const [scrolled, setScrolled] = useState(false)
  // Heading currently being read (TOC highlight)
  const [activeId, setActiveId] = useState('')
  // Narrow screens: contents drawer
  const [tocOpen, setTocOpen] = useState(false)
  // After a TOC jump, hold the highlight so smooth scrolling can't override it
  const clickLockRef = useRef(0)
  const [toc, setToc] = useState<TocItem[]>([])

  // Title lives in its own region (an <h1> in the header). The body must never
  // contribute a second h1: any h1 in the markdown is demoted to h2.
  const bodyHtml = useMemo<string>(() => {
    if (!post?.content) return ''
    const raw = marked.parse(post.content)
    const clean = DOMPurify.sanitize(typeof raw === 'string' ? raw : '')
    const doc = new DOMParser().parseFromString(`<div id="post-root">${clean}</div>`, 'text/html')
    const root = doc.getElementById('post-root')!
    root.querySelectorAll('h1').forEach((h) => {
      const h2 = doc.createElement('h2')
      h2.innerHTML = h.innerHTML
      h.replaceWith(h2)
    })
    return root.innerHTML
  }, [post])

  useEffect(() => {
    const body = bodyRef.current
    if (!body) return
    body.querySelectorAll('pre code').forEach((block) => {
      const lang = (block.className.match(/language-([\w-]+)/) || [])[1]
      // No explicit language → leave it as plain text. Auto-detect mangles
      // mixed CJK snippets and writes a bogus `language-undefined` class.
      if (!lang) return
      const el = block as HTMLElement
      el.dataset.lang = lang
      hljs.highlightElement(el)
    })

    body.querySelectorAll('.post__body > table').forEach((table) => {
      if (table.parentElement!.classList.contains('post__table-wrap')) return
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
      // Wrap in a non-scrolling container so the Copy button stays put while code scrolls
      const wrap = document.createElement('div')
      wrap.className = 'post__code-block'
      pre.parentNode!.insertBefore(wrap, pre)
      wrap.appendChild(pre)

      const code = pre.querySelector('code')
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'post__copy'
      button.textContent = 'Copy'
      button.setAttribute('aria-label', 'Copy code')
      button.addEventListener('click', async (e: MouseEvent) => {
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
        if (!block.textContent!.trim() && !(block as HTMLElement).dataset.lang) return
        window.hljs!.lineNumbersBlockSync!(block as HTMLElement, { singleLine: true })
      })
    })
    return () => {
      alive = false
    }
  }, [bodyHtml])

  // Collect the table of contents: anchor every h1/h2/h3, keep their text.
  // h1 is included on purpose: articles written with `#` sections (older posts)
  // would otherwise show up with a nearly empty Contents list.
  useEffect(() => {
    const body = bodyRef.current
    if (!body) return
    const headings = [...body.querySelectorAll('h1, h2, h3')]
    headings.forEach((h, i) => {
      if (!h.id) h.id = headingId(i)
    })
    setToc(
      headings.map((h, i) => ({
        id: h.id,
        depth: h.tagName.toLowerCase(),
        text: h.textContent!.trim(),
      })),
    )
    if (headings[0]) setActiveId(headings[0].id)
  }, [bodyHtml])

  // Scroll: sticky bar visibility + which heading is being read
  useEffect(() => {
    if (status !== 'success' || !post) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 220)
        // Inside the lock window after a jump: don't override the highlight
        if (clickLockRef.current > Date.now()) return
        const body = bodyRef.current
        if (!body) return
        const headings = [...body.querySelectorAll('h1, h2, h3')]
        if (!headings.length) return
        // Topmost heading already at (or above) the reading line
        const probe = window.scrollY + 140
        let current = headings[0]
        for (const h of headings) {
          if (h.getBoundingClientRect().top + window.scrollY <= probe) current = h
          else break
        }
        if (current.id !== activeId) setActiveId(current.id)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [status, post, bodyHtml, activeId])

  // Contents click: smooth-scroll to the heading; close the drawer on narrow screens
  const scrollToHeading = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    // Hold the highlight for the whole smooth scroll (~900ms)
    clickLockRef.current = Date.now() + 900
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
    setActiveId(id)
    setTocOpen(false)
  }

  // Drawer: lock page scroll while open, close on Escape
  useEffect(() => {
    if (!tocOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTocOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [tocOpen])

  return (
    <article className="page container post">
      {/* Sticky reading bar: appears after the article head scrolls away */}
      {status === 'success' && post && (
        <div className={`post__sticky-bar${scrolled ? ' is-visible' : ''}`}>
          <div className="post__sticky-inner">
            <Link className="post__sticky-back" to="/blog">
              ← All posts
            </Link>
            <span className="post__sticky-title">{post.title}</span>
            {toc.length > 0 && (
              <button
                type="button"
                className="post__sticky-toc-btn"
                onClick={() => setTocOpen(true)}
              >
                Contents
              </button>
            )}
          </div>
        </div>
      )}

      {status === 'loading' && <LoadingState />}
      {status === 'error' && <ErrorState onRetry={retry} />}
      {status === 'success' && post === null && <EmptyState message="Post not found or unpublished." />}

      {status === 'success' && post && (
        <>
          <div className="post__layout">
            <div className="post__main">
              <Link className="back-link" to="/blog">
                <span aria-hidden="true">←</span> All posts
              </Link>
              <header className="post__head">
                <p className="kicker">{post.published === false ? 'Draft preview' : 'Article'}</p>
                <h1 className="post__title">{post.title}</h1>
                {post.subtitle ? <p className="post__subtitle">{post.subtitle}</p> : null}
                <div className="post__meta">
                  <time className="post-row__date" dateTime={post.created_at || undefined}>
                    {formatDate(post.created_at)}
                  </time>
                  {post.collection && (
                    <Link
                      className="collection-badge"
                      to={`/blog/collections/${post.collection.public_id || post.collection.slug}`}
                    >
                      {post.collection.name}
                    </Link>
                  )}
                  {post.tags && post.tags.length > 0 && (
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
            </div>

            {/* Contents: sticky rail on wide screens, slide-in drawer on narrow ones */}
            {toc.length > 0 && (
              <>
                <div
                  className={`post__toc-mask${tocOpen ? ' is-open' : ''}`}
                  onClick={() => setTocOpen(false)}
                  aria-hidden="true"
                />
                <aside className={`post__toc${tocOpen ? ' is-open' : ''}`} aria-label="Contents">
                  <div className="post__toc-head">
                    <p className="post__toc-title">Contents</p>
                    <button
                      type="button"
                      className="post__toc-close"
                      onClick={() => setTocOpen(false)}
                      aria-label="Close contents"
                    >
                      ×
                    </button>
                  </div>
                  <nav>
                    <ul>
                      {toc.map((item, i) => (
                        <li key={item.id} className={`post__toc-item post__toc-${item.depth}`}>
                          <a
                            href={`#${item.id}`}
                            className={activeId === item.id ? 'is-active' : undefined}
                            onClick={(e) => scrollToHeading(e, item.id)}
                          >
                            <span className="post__toc-num" aria-hidden="true">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            {item.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </aside>
              </>
            )}
          </div>
        </>
      )}
    </article>
  )
}

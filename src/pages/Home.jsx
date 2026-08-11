import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchPosts } from '../api.js'
import { formatDate } from '../utils.js'
import useAsync from '../hooks/useAsync.js'
import { LoadingState, ErrorState, EmptyState } from '../components/States.jsx'

const STACK = 'Vue 2/3 · React · Flutter · TypeScript · Node.js · MySQL / SQLite'

function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('[data-reveal]'))
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container swiss-grid hero__inner" data-reveal>
        <div className="hero__cell">
          <p className="hero__kicker">个人主页｜Portfolio</p>
          <h1 className="hero__name">张云凌</h1>
          <p className="hero__sub">写代码，做产品，关注细节。</p>
          <p className="hero__quote">立志欲坚不欲锐，成功在久不在速。 —— 张孝祥</p>
          <a className="hero__scroll" href="#about" aria-label="向下滚动">
            <span className="hero__arrow">↓</span>
            开始浏览
          </a>
        </div>
      </div>
    </section>
  )
}

function About() {
  return (
    <section className="section swiss-section" id="about">
      <div className="container swiss-grid">
        <div className="swiss-rail" data-reveal>
          <span className="swiss-num" aria-hidden="true">
            01
          </span>
          <h2 className="kicker">关于</h2>
        </div>
        <div className="swiss-content" data-reveal>
          <p className="about__lead">你好，我是张云凌，一名前端开发工程师。</p>
          <p className="about__body">
            平时写 Vue，也写 Flutter，偶尔写一点 Node.js。
            喜欢把复杂的东西做得简单、安静、好用。
            这里是互联网上属于我的一个小角落。
          </p>
        </div>
      </div>
    </section>
  )
}

function Stack() {
  return (
    <section className="section swiss-section" id="stack">
      <div className="container swiss-grid">
        <div className="swiss-rail" data-reveal>
          <span className="swiss-num" aria-hidden="true">
            02
          </span>
          <h2 className="kicker">技术</h2>
        </div>
        <div className="swiss-content" data-reveal>
          <p className="stack__text">日常使用的技术，大多是些常见的东西。</p>
          <p className="stack__items">{STACK}</p>
        </div>
      </div>
    </section>
  )
}

function LatestPosts() {
  const { status, data, retry } = useAsync(fetchPosts, [])
  const latest = (data || []).slice(0, 3)

  return (
    <section className="section swiss-section" id="latest">
      <div className="container swiss-grid">
        <div className="swiss-rail" data-reveal>
          <span className="swiss-num" aria-hidden="true">
            03
          </span>
          <h2 className="kicker">最新文章</h2>
        </div>
        <div className="swiss-content" data-reveal>
          {status === 'loading' && <LoadingState />}
          {status === 'error' && <ErrorState onRetry={retry} />}
          {status === 'success' && latest.length === 0 && <EmptyState message="还没有文章" />}
          {status === 'success' && latest.length > 0 && (
            <>
              <div className="posts-mini">
                {latest.map((post, i) => (
                  <article className="post-row post-row--mini" key={post.id}>
                    <time className="post-row__date" dateTime={post.created_at}>
                      {formatDate(post.created_at)}
                    </time>
                    <span className="post-row__num" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <Link className="post-row__main" to={`/blog/${post.slug}`}>
                      <h3 className="post-row__title">{post.title}</h3>
                      {post.excerpt && <p className="post-row__excerpt">{post.excerpt}</p>}
                    </Link>
                  </article>
                ))}
              </div>
              <Link className="posts-mini__more" to="/blog">
                查看全部文章 →
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section className="section section--last swiss-section" id="contact">
      <div className="container swiss-grid">
        <div className="swiss-rail" data-reveal>
          <span className="swiss-num" aria-hidden="true">
            04
          </span>
          <h2 className="kicker">联系</h2>
        </div>
        <div className="swiss-content" data-reveal>
          <div className="contact__links">
            <a className="contact__mail" href="mailto:zhangyunlingzh@gmail.com">
              zhangyunlingzh@gmail.com
            </a>
            <a
              className="contact__mail"
              href="https://github.com/YLing2024"
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  useReveal()

  return (
    <>
      <Hero />
      <About />
      <Stack />
      <LatestPosts />
      <Contact />
    </>
  )
}

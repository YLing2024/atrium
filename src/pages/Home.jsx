import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchPosts } from '../api.js'
import { formatDate } from '../utils.js'
import useAsync from '../hooks/useAsync.js'
import { LoadingState, ErrorState, EmptyState } from '../components/States.jsx'

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
      <div className="container hero__inner" data-reveal>
        <div className="hero__meta">
          <p className="hero__kicker">Portfolio — self-hosted · front-end</p>
          <p className="hero__coords" aria-hidden="true">
            Hangzhou · CN — zhangyunling.cn
          </p>
        </div>

        <h1 className="hero__name">
          <span className="hero__name-line">Yunling</span>
          <span className="hero__name-line">Zhang</span>
        </h1>

        <div className="hero__bottom">
          <p className="hero__role">
            <span className="hero__role-dot" aria-hidden="true" />
            <span className="hero__role-label">Front-End Engineer</span>
          </p>
          <div className="hero__line">
            <p className="hero__sub">Interfaces on the front. Infrastructure underneath.</p>
            <p className="hero__quote">
              立志欲坚不欲锐，成功在久不在速。
              <span className="hero__quote-attrib">—— 张孝祥</span>
            </p>
          </div>
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
          <h2 className="kicker section-kicker">About</h2>
        </div>
        <div className="swiss-content" data-reveal>
          <p className="about__lead">
            I build <strong>interfaces</strong> for the web, then run them myself on{' '}
            <strong>quiet little servers</strong>.
          </p>
          <p className="about__body">
            Ten years of front-end work across Vue, React and Flutter. Writing product code by
            day; self-hosting the services behind this site — blog, photo album, file storage —
            by night. I prefer small tools that do one thing well, and systems that stay boring.
          </p>
          <div className="about__facts">
            <div className="about__fact">
              <span className="about__fact-label">Focus</span>
              <span className="about__fact-value">Interfaces &amp; self-hosting</span>
            </div>
            <div className="about__fact">
              <span className="about__fact-label">Since</span>
              <span className="about__fact-value">2016 — writing for the web</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const TOOLS = [
  { svc: 'Homepage', scope: 'React · Vite · CSS · nginx · Certbot', kind: 'Site' },
  { svc: 'Blog', scope: 'Node.js · Express · SQLite', kind: 'API' },
  { svc: 'Photo album', scope: 'Flutter · Dart · self-hosted', kind: 'App' },
  { svc: 'File storage', scope: 'Node.js · Cloudreve · Cloudflare', kind: 'Service' },
  { svc: 'This server', scope: 'Linux · Docker · Caddy', kind: 'Infra' },
]

function Stack() {
  return (
    <section className="section swiss-section" id="stack">
      <div className="container swiss-grid">
        <div className="swiss-rail" data-reveal>
          <span className="swiss-num" aria-hidden="true">
            02
          </span>
          <h2 className="kicker section-kicker">Infra</h2>
        </div>
        <div className="swiss-content" data-reveal>
          <p className="stack__text">
            Tools are only good while they stay out of the way — dependable, boring, on.
          </p>
          <ul className="tools-list">
            {TOOLS.map((t) => (
              <li className="tools-row" key={t.svc}>
                <span className="tools-row__service">{t.svc}</span>
                <span className="tools-row__scope">{t.scope}</span>
                <span className="tools-row__stack">{t.kind}</span>
              </li>
            ))}
          </ul>
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
          <h2 className="kicker section-kicker">Writing</h2>
        </div>
        <div className="swiss-content" data-reveal>
          {status === 'loading' && <LoadingState />}
          {status === 'error' && <ErrorState onRetry={retry} />}
          {status === 'success' && latest.length === 0 && <EmptyState message="No posts yet." />}
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
                      <h3 className="post-row__title">
                        {post.title}
                        <span className="post-row__title-arrow" aria-hidden="true">
                          →
                        </span>
                      </h3>
                      {post.excerpt && <p className="post-row__excerpt">{post.excerpt}</p>}
                    </Link>
                  </article>
                ))}
              </div>
              <Link className="posts-mini__more" to="/blog">
                All posts <span aria-hidden="true">→</span>
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
          <h2 className="kicker section-kicker">Contact</h2>
        </div>
        <div className="swiss-content" data-reveal>
          <p className="contact__intro">
            Working on something interesting? I&apos;m usually up for a chat about the web,
            self-hosting, or both.
          </p>
          <div className="contact__links">
            <a className="contact__link" href="mailto:zhangyunlingzh@gmail.com">
              zhangyunlingzh@gmail.com
            </a>
            <a
              className="contact__link"
              href="https://github.com/YLing2024"
              target="_blank"
              rel="noreferrer"
            >
              GitHub <span aria-hidden="true">↗</span>
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

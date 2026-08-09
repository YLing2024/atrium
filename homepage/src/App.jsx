import { useEffect, useState } from 'react'

const NAV_LINKS = [
  { id: 'about', label: '关于' },
  { id: 'stack', label: '技术' },
  { id: 'contact', label: '联系' },
]

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

function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
      <div className="nav__inner">
        <a className="nav__brand" href="#top">
          张云凌
        </a>
        <nav className="nav__links">
          {NAV_LINKS.map(({ id, label }) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero__inner" data-reveal>
        <p className="hero__kicker">个人主页</p>
        <h1 className="hero__name">张云凌</h1>
        <p className="hero__sub">写代码，做产品，关注细节。</p>
        <a className="hero__scroll" href="#about" aria-label="向下滚动">
          <span className="hero__arrow">↓</span>
        </a>
      </div>
    </section>
  )
}

function About() {
  return (
    <section className="section" id="about">
      <div className="container">
        <p className="kicker" data-reveal>
          关于
        </p>
        <p className="about__lead" data-reveal>
          你好，我是张云凌，一名前端开发工程师。
        </p>
        <p className="about__body" data-reveal>
          平时写 Vue，也写 Flutter，偶尔写一点 Node.js。
          喜欢把复杂的东西做得简单、安静、好用。
          这里是互联网上属于我的一个小角落。
        </p>
      </div>
    </section>
  )
}

function Stack() {
  return (
    <section className="section" id="stack">
      <div className="container">
        <p className="kicker" data-reveal>
          技术
        </p>
        <p className="stack__text" data-reveal>
          日常使用的技术，大多是些常见的东西。
        </p>
        <p className="stack__items" data-reveal>
          {STACK}
        </p>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section className="section section--last" id="contact">
      <div className="container">
        <div data-reveal>
          <p className="kicker">联系</p>
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

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span>© 2026 张云凌</span>
      </div>
    </footer>
  )
}

export default function App() {
  useReveal()

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Stack />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

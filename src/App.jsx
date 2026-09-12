import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import BlogList from './pages/BlogList.jsx'
import BlogPost from './pages/BlogPost.jsx'
import Collections from './pages/Collections.jsx'
import CollectionDetail from './pages/CollectionDetail.jsx'
import { getTheme, cycleTheme, applyTheme, effectiveTheme } from './theme.js'

const THEME_TITLE = {
  auto: 'Theme: system (click to change)',
  light: 'Theme: light (click to change)',
  dark: 'Theme: dark (click to change)'
}

function ThemeIcon({ theme }) {
  if (theme === 'light') {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22" />
        <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
        <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
        <line x1="2" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
        <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
      </svg>
    )
  }

  if (theme === 'dark') {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    )
  }

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" />
    </svg>
  )
}

const NAV_LINKS = [
  { to: '/', label: 'Home', index: '01', end: true },
  { to: '/blog', label: 'Blog', index: '02', end: false },
]

function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

function Nav() {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState(() => getTheme())
  const { pathname } = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    if (theme !== 'auto') return
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('auto')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  useEffect(() => {
    document.body.classList.toggle('nav-open', open)
    if (!open) return () => document.body.classList.remove('nav-open')
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('nav-open')
    }
  }, [open])

  const close = () => setOpen(false)

  const linkClass = ({ isActive }) => (isActive ? 'is-active' : undefined)

  return (
    <>
      <header className="nav">
        <div className="container nav__inner">
          <Link className="nav__brand" to="/" aria-label="Yunling Zhang — Home">
            <span className="nav__brand-mark" aria-hidden="true" />
          </Link>

          <nav className="nav__links" aria-label="Primary">
            {NAV_LINKS.map(({ to, label, index, end }) => (
              <NavLink key={to} to={to} end={end} className={linkClass}>
                <span className="nav__index" aria-hidden="true">
                  {index}
                </span>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="nav__actions">
            <button
              type="button"
              className="nav__theme"
              onClick={() => setTheme(cycleTheme())}
              title={THEME_TITLE[theme]}
              aria-label={THEME_TITLE[theme]}
            >
              <ThemeIcon theme={theme} />
            </button>

            <button
              type="button"
              className={`nav__toggle${open ? ' is-open' : ''}`}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div
        id="site-menu"
        className={`nav-drawer${open ? ' is-open' : ''}`}
        aria-hidden={!open}
        onClick={close}
      >
        <nav className="container nav-drawer__inner" aria-label="Mobile">
          {NAV_LINKS.map(({ to, label, index, end }) => (
            <NavLink key={to} to={to} end={end} className="nav-drawer__link" onClick={close}>
              <span className="nav-drawer__num" aria-hidden="true">
                {index}
              </span>
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span>© 2026 Yunling Zhang</span>
        <span className="footer__note">Made by hand</span>
      </div>
    </footer>
  )
}

function Layout() {
  return (
    <div className="swiss">
      <ScrollManager />
      <Nav />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="blog" element={<BlogList />} />
        <Route path="blog/collections" element={<Collections />} />
        <Route path="blog/collections/:slug" element={<CollectionDetail />} />
        <Route path="blog/:slug" element={<BlogPost />} />
      </Route>
    </Routes>
  )
}

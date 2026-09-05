import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import BlogList from './pages/BlogList.jsx'
import BlogPost from './pages/BlogPost.jsx'
import Collections from './pages/Collections.jsx'
import CollectionDetail from './pages/CollectionDetail.jsx'

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
  const { pathname } = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

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

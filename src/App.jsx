import { useEffect } from 'react'
import { Routes, Route, NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import BlogList from './pages/BlogList.jsx'
import BlogPost from './pages/BlogPost.jsx'
import Collections from './pages/Collections.jsx'
import CollectionDetail from './pages/CollectionDetail.jsx'

const NAV_LINKS = [
  { to: '/', label: '首页', index: '01' },
  { to: '/blog', label: '博客', index: '02' },
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
  return (
    <header className="nav">
      <div className="container nav__inner">
        <Link className="nav__brand" to="/">
          <span className="nav__brand-name">张云凌</span>
          <span className="nav__brand-tag">ZHANG YUNLING</span>
        </Link>
        <nav className="nav__links" aria-label="主导航">
          {NAV_LINKS.map(({ to, label, index }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => (isActive ? 'is-active' : undefined)}
            >
              <span className="nav__index" aria-hidden="true">
                {index}
              </span>
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span>© 2026 张云凌</span>
        <span className="footer__note">Front-End Developer</span>
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

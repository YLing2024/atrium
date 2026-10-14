import { Fragment, useEffect, useState } from 'react'
import { Routes, Route, NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import BlogList from './pages/BlogList'
import BlogPost from './pages/BlogPost'
import Collections from './pages/Collections'
import CollectionDetail from './pages/CollectionDetail'
import Apps from './pages/Apps'
import { getTheme, nextTheme, applyTheme, type Theme } from './theme'

/** 主题按钮的可见文字，三态各一个词。 */
const THEME_LABEL: Record<Theme, string> = {
  auto: 'Auto',
  light: 'Light',
  dark: 'Dark',
}

/** 主题按钮的 title 与 aria-label，说明当前态与点击行为。 */
const THEME_TITLE: Record<Theme, string> = {
  auto: 'Theme: system (click to change)',
  light: 'Theme: light (click to change)',
  dark: 'Theme: dark (click to change)',
}

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/blog', label: 'Blog', end: false },
  { to: '/apps', label: 'Apps', end: false },
] as const

/**
 * 路由切换后的滚动处理：带 hash 时滚到对应锚点，否则回到页首。
 * 用浏览器默认的即时滚动，不再做平滑滚动或滚动高亮。
 */
function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView()
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

/**
 * 顶栏：品牌菱形 + 行内导航 + 主题按钮。
 * 没有抽屉、没有图标绘制；窄屏由浏览器自动换行。
 */
function Nav() {
  const [theme, setTheme] = useState<Theme>(() => getTheme())

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // auto 态跟随系统深浅色变化，用户不用操作也保持在正确配色
  useEffect(() => {
    if (theme !== 'auto') return
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('auto')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  return (
    <header>
      <nav className="container" aria-label="Primary">
        <Link to="/" aria-label="Linden Zhang — Home">
          <span aria-hidden="true">◇</span>
        </Link>{' '}
        {NAV_LINKS.map(({ to, label, end }) => (
          <Fragment key={to}>
            <NavLink to={to} end={end}>
              {label}
            </NavLink>{' '}
          </Fragment>
        ))}
        <button
          type="button"
          onClick={() => setTheme(nextTheme(theme))}
          title={THEME_TITLE[theme]}
          aria-label={THEME_TITLE[theme]}
        >
          {THEME_LABEL[theme]}
        </button>
      </nav>
    </header>
  )
}

/** 页脚：纯文本。 */
function Footer() {
  return (
    <footer className="container">
      <p>© 2026 Linden Zhang</p>
    </footer>
  )
}

/** 站点外壳：顶栏 + 主内容（限宽）+ 页脚。 */
function Layout() {
  return (
    <>
      <ScrollManager />
      <Nav />
      <main className="container">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="apps" element={<Apps />} />
        <Route path="blog" element={<BlogList />} />
        <Route path="blog/collections" element={<Collections />} />
        <Route path="blog/collections/:slug" element={<CollectionDetail />} />
        <Route path="blog/:slug" element={<BlogPost />} />
      </Route>
    </Routes>
  )
}

// 主题三态：auto 跟随系统、light / dark 强制覆盖。
// 取值同时充当运行时白名单（读取 localStorage 时校验）与字面量联合类型的唯一来源。

/** 站点主题的三个取值。 */
export type Theme = 'auto' | 'light' | 'dark'

const THEME_KEY = 'site_theme'
const THEMES: readonly Theme[] = ['auto', 'light', 'dark']

function isTheme(value: string | null): value is Theme {
  return value !== null && THEMES.includes(value as Theme)
}

/** 读取已保存的主题；没有浏览器存储、没有有效值或存储不可用时回退 auto。 */
export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'auto'
  try {
    const stored = localStorage.getItem(THEME_KEY)
    return isTheme(stored) ? stored : 'auto'
  } catch {
    return 'auto'
  }
}

/** 循环顺序：auto → light → dark → auto。纯函数，便于单测。 */
export function nextTheme(theme: Theme): Theme {
  if (theme === 'auto') return 'light'
  if (theme === 'light') return 'dark'
  return 'auto'
}

/**
 * 落地主题：把 data-theme 写到 <html>，让浏览器按 color-scheme 切换默认配色。
 *
 * 代码高亮的两套样式表是 index.html 里的两个 <link>，只切 color-scheme 不会换
 * hljs 皮肤：手动选深色时 github.css 会留在浅色，代码块将不可读。因此这里同步
 * 开合这两个 link 的 media（auto 则交回 prefers-color-scheme 查询，跟随系统）。
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  if (theme === 'auto') {
    delete root.dataset.theme
  } else {
    root.dataset.theme = theme
  }

  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // 隐私模式等存储不可用：静默降级，不影响渲染
  }

  const lightLink = document.getElementById('hljs-light')
  const darkLink = document.getElementById('hljs-dark')
  if (theme === 'auto') {
    if (lightLink) lightLink.setAttribute('media', '(prefers-color-scheme: light)')
    if (darkLink) darkLink.setAttribute('media', '(prefers-color-scheme: dark)')
    return
  }

  const dark = theme === 'dark'
  if (lightLink) lightLink.setAttribute('media', dark ? 'not all' : 'all')
  if (darkLink) darkLink.setAttribute('media', dark ? 'all' : 'not all')
}

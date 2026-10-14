const THEME_KEY = 'site_theme'

// 主题的三个取值 —— 同时作为运行时白名单与字面量联合类型的唯一来源
const THEMES = ['auto', 'light', 'dark'] as const
export type Theme = (typeof THEMES)[number]

function isTheme(value: string | null): value is Theme {
  return value !== null && (THEMES as readonly string[]).includes(value)
}

export function getTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    return isTheme(stored) ? stored : 'auto'
  } catch (e) {
    return 'auto'
  }
}

export function systemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function effectiveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'light' || theme === 'dark') return theme
  return systemPrefersDark() ? 'dark' : 'light'
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  const effective = effectiveTheme(theme)

  if (theme === 'auto') {
    delete root.dataset.theme
  } else {
    root.dataset.theme = theme
  }

  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch (e) {
    // localStorage unavailable (private mode) — stay silent
  }

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', effective === 'dark' ? '#13110f' : '#f7f6f3')
  }

  const lightLink = document.getElementById('hljs-light')
  const darkLink = document.getElementById('hljs-dark')

  if (theme === 'auto') {
    if (lightLink) lightLink.setAttribute('media', '(prefers-color-scheme: light)')
    if (darkLink) darkLink.setAttribute('media', '(prefers-color-scheme: dark)')
  } else if (theme === 'dark') {
    if (lightLink) lightLink.setAttribute('media', 'not all')
    if (darkLink) darkLink.setAttribute('media', 'all')
  } else {
    if (lightLink) lightLink.setAttribute('media', 'all')
    if (darkLink) darkLink.setAttribute('media', 'not all')
  }
}

export function cycleTheme(): Theme {
  const next: Theme = { auto: 'light', light: 'dark', dark: 'auto' }[getTheme()] as Theme
  applyTheme(next)
  return next
}

export function initTheme(): void {
  applyTheme(getTheme())
}

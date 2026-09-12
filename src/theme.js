const THEME_KEY = 'site_theme'
const THEMES = ['auto', 'light', 'dark']

export function getTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    return THEMES.includes(stored) ? stored : 'auto'
  } catch (e) {
    return 'auto'
  }
}

export function systemPrefersDark() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function effectiveTheme(theme) {
  if (theme === 'light' || theme === 'dark') return theme
  return systemPrefersDark() ? 'dark' : 'light'
}

export function applyTheme(theme) {
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

export function cycleTheme() {
  const next = { auto: 'light', light: 'dark', dark: 'auto' }[getTheme()] || 'light'
  applyTheme(next)
  return next
}

export function initTheme() {
  applyTheme(getTheme())
}

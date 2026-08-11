export function formatDate(value) {
  const date = String(value || '').trim().split(' ')[0]
  return date ? date.replace(/-/g, '.') : ''
}

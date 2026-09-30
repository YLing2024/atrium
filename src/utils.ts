export function formatDate(value: string | null | undefined): string {
  const date = String(value || '').trim().split(' ')[0]
  return date ? date.replace(/-/g, '.') : ''
}

const ABSOLUTE_URL_RE = /^(?:[a-z]+:)?\/\//i

export function withBase(path) {
  const raw = String(path || '').trim()
  if (!raw) return raw
  if (
    ABSOLUTE_URL_RE.test(raw) ||
    raw.startsWith('data:') ||
    raw.startsWith('blob:')
  ) {
    return raw
  }

  const base = String(import.meta.env.BASE_URL || '/')
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const normalizedPath = raw.replace(/^\/+/, '')
  return `${normalizedBase}${normalizedPath}`
}


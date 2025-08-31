export function parseYouTubeUrlToId(urlOrId: string): string | null {
  const s = urlOrId.trim()
  // If already just an ID-like string
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s
  try {
    const u = new URL(s)
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.split('/')[1] || null
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v) return v
      // handle /shorts/ID or /embed/ID
      const parts = u.pathname.split('/').filter(Boolean)
      const idx = parts.findIndex((p) => p === 'shorts' || p === 'embed')
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1]
    }
    return null
  } catch {
    return null
  }
}

export function getYoutubeId(urlOrId: string): string | null {
  // Kalau langsung kasih ID (11 char biasanya)
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
    return urlOrId
  }

  try {
    const url = new URL(urlOrId)

    // Format: https://www.youtube.com/watch?v=VIDEO_ID
    if (url.searchParams.has('v')) {
      return url.searchParams.get('v')
    }

    // Format: https://youtu.be/VIDEO_ID
    if (url.hostname === 'youtu.be') {
      return url.pathname.split('/')[1] || null
    }

    // Format embed: https://www.youtube.com/embed/VIDEO_ID
    if (url.pathname.startsWith('/embed/')) {
      return url.pathname.split('/')[2] || null
    }

    // Format live: https://www.youtube.com/live/VIDEO_ID
    if (url.pathname.startsWith('/live/')) {
      return url.pathname.split('/')[2] || null
    }

    return null
  } catch {
    // bukan URL valid
    return null
  }
}

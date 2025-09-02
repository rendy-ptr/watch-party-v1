export function extractVideoId(url: string): string {
  const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/)([^"&?/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : url
}

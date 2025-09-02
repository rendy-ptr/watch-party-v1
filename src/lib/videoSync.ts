export const calculateTimeDifference = (
  currentTime: number,
  targetTime: number,
  tolerance: number = 2,
): boolean => {
  return Math.abs(currentTime - targetTime) > tolerance
}

export const getVideoIdFromUrl = (url: string): string | null => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&\n?#]+)/)
  return match ? match[1] : null
}

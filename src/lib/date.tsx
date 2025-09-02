export function formatToWIB(timestamp: number): string {
  const date = new Date(timestamp)

  return date.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  })
}

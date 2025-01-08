export function absoluteUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const absoluteUrl = new URL(path, baseUrl)
  return absoluteUrl.toString()
}

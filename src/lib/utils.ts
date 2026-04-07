export function generateSlug(brandName: string): string {
  return brandName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function generateCode(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function getExpirationDate(duration: '24h' | '48h' | '7d'): Date {
  const now = new Date()
  switch (duration) {
    case '24h':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    case '48h':
      return new Date(now.getTime() + 48 * 60 * 60 * 1000)
    case '7d':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  }
}

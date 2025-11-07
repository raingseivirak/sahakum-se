import bcrypt from 'bcryptjs'

/**
 * Generate a secure temporary password
 * Format: word-word-number (e.g., "happy-tree-2934")
 * Easy to remember and type, but still secure
 */
export function generateTemporaryPassword(): string {
  const adjectives = [
    'happy', 'bright', 'swift', 'calm', 'brave', 'kind', 'smart', 'cool',
    'warm', 'fresh', 'clear', 'strong', 'quick', 'gentle', 'proud', 'free'
  ]

  const nouns = [
    'tree', 'river', 'mountain', 'ocean', 'star', 'moon', 'cloud', 'bird',
    'flower', 'sun', 'wind', 'rain', 'snow', 'fire', 'stone', 'wave'
  ]

  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
  const randomNumber = Math.floor(1000 + Math.random() * 9000) // 4-digit number

  return `${randomAdjective}-${randomNoun}-${randomNumber}`
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
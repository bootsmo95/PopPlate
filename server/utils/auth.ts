import { verifyPassword } from 'nuxt-auth-utils/dist/runtime/server/utils/password.js'
import type { H3Event } from 'h3'

/**
 * Verify a plain-text password against a stored hash.
 * Uses nuxt-auth-utils' scrypt-based verifyPassword under the hood.
 */
export async function checkPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return verifyPassword(hashedPassword, plainPassword)
}

/**
 * Get the currently authenticated user from the session.
 * Returns null if there is no valid session.
 */
export async function getSessionUser(event: H3Event) {
  const session = await getUserSession(event)
  return session?.user ?? null
}

/**
 * Throw a 401 Unauthorized error if the request is not authenticated.
 * Use this at the top of any protected API route.
 */
export async function requireAuth(event: H3Event) {
  return requireUserSession(event, {
    statusCode: 401,
    message: 'Unauthorized',
  })
}

import type { H3Event } from 'h3'

export async function checkPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  // verifyPassword is auto-imported by nuxt-auth-utils in server context
  return verifyPassword(hashedPassword, plainPassword)
}

export async function getSessionUser(event: H3Event) {
  const session = await getUserSession(event)
  return session?.user ?? null
}

export async function requireAuth(event: H3Event) {
  return requireUserSession(event, {
    statusCode: 401,
    message: 'Unauthorized',
  })
}

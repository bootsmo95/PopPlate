import type { H3Event } from 'h3'
import { eq } from 'drizzle-orm'
import { db } from '../database/index'
import { users } from '../database/schema'

export interface SessionUser {
  id: string
  email: string
  displayName?: string
  role: string
  accountTier: string
}

export async function checkPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return verifyPassword(hashedPassword, plainPassword)
}

export async function getSessionUser(event: H3Event): Promise<SessionUser | null> {
  const session = await getUserSession(event)
  return (session?.user as SessionUser) ?? null
}

export async function requireAuth(event: H3Event): Promise<{ user: SessionUser }> {
  const result = await requireUserSession(event, {
    statusCode: 401,
    message: 'Unauthorized',
  })
  return { user: result.user as SessionUser }
}

export async function getDbUser(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  return user ?? null
}

import { eq } from 'drizzle-orm'
import { db } from '../../database/index'
import { users } from '../../database/schema'
import type { SessionUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; password: string; displayName: string }>(event)

  if (!body?.email || !body?.password || !body?.displayName) {
    throw createError({ statusCode: 400, message: 'Email, password, and display name are required' })
  }

  const email = body.email.toLowerCase().trim()
  const displayName = body.displayName.trim()

  if (body.password.length < 8) {
    throw createError({ statusCode: 400, message: 'Password must be at least 8 characters' })
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (existing) {
    throw createError({ statusCode: 409, message: 'An account with this email already exists' })
  }

  const passwordHash = await hashPassword(body.password)

  const [user] = await db
    .insert(users)
    .values({
      email,
      displayName,
      passwordHash,
      role: 'admin',
      accountTier: 'free',
    })
    .returning()

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    accountTier: user.accountTier,
  }

  await setUserSession(event, { user: sessionUser })

  return { user: sessionUser }
})

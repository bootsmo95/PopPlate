import { eq } from 'drizzle-orm'
import { db } from '../../database/index'
import { users } from '../../database/schema'
import { checkPassword, type SessionUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; password: string }>(event)

  if (!body?.email || !body?.password) {
    throw createError({ statusCode: 400, message: 'Email and password are required' })
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, body.email.toLowerCase()))
    .limit(1)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

  const passwordValid = await checkPassword(body.password, user.passwordHash)
  if (!passwordValid) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    accountTier: user.accountTier,
  }

  await setUserSession(event, { user: sessionUser })

  return { user: sessionUser }
})

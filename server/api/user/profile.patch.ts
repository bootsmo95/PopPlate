import { eq } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'
import { db } from '../../database/index'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)
  const body = await readBody<{ displayName?: string }>(event)

  if (body.displayName !== undefined) {
    const trimmed = body.displayName.trim()
    if (!trimmed || trimmed.length > 100) {
      throw createError({ statusCode: 400, message: 'Display name must be 1-100 characters' })
    }
    body.displayName = trimmed
  }

  const [updated] = await db
    .update(users)
    .set({
      ...(body.displayName !== undefined && { displayName: body.displayName }),
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id))
    .returning({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      role: users.role,
      accountTier: users.accountTier,
    })

  if (!updated) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  // Update the session so the client sees the new displayName immediately
  await setUserSession(event, {
    user: {
      id: updated.id,
      email: updated.email,
      displayName: updated.displayName,
      role: updated.role,
      accountTier: updated.accountTier,
    },
  })

  return updated
})

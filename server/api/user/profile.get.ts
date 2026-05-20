import { requireAuth, getDbUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)
  const dbUser = await getDbUser(user.id)

  if (!dbUser) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  return {
    id: dbUser.id,
    email: dbUser.email,
    displayName: dbUser.displayName,
    role: dbUser.role,
    accountTier: dbUser.accountTier,
    createdAt: dbUser.createdAt,
  }
})

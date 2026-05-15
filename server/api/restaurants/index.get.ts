import { eq } from 'drizzle-orm'
import { db } from '../../database/index'
import { restaurants } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { hasUnlimitedAccess } from '../../utils/access'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  if (hasUnlimitedAccess(user)) {
    return db.select().from(restaurants)
  }

  const userRestaurants = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.ownerId, user.id))

  return userRestaurants
})

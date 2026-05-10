import { db } from '../../database/index'
import { dishes } from '../../database/schema'
import { desc } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const allDishes = await db
    .select()
    .from(dishes)
    .orderBy(desc(dishes.createdAt))

  return allDishes
})

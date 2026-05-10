import { db } from '../../database/index'
import { restaurants } from '../../database/schema'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const all = await db.select().from(restaurants)

  return all
})

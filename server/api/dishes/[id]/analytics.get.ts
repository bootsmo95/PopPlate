import { db } from '../../../database/index'
import { analyticsEvents } from '../../../database/schema'
import { eq, sql } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'id is required' })
  }

  const rows = await db
    .select({
      eventType: analyticsEvents.eventType,
      count: sql<number>`count(*)::int`,
    })
    .from(analyticsEvents)
    .where(eq(analyticsEvents.dishId, id))
    .groupBy(analyticsEvents.eventType)

  const result: Record<string, number> = {
    page_open: 0,
    viewer_loaded: 0,
    ar_launch_clicked: 0,
  }

  for (const row of rows) {
    result[row.eventType] = row.count
  }

  return result
})

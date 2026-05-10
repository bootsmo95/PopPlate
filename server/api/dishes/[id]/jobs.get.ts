import { db } from '../../../database/index'
import { generationJobs } from '../../../database/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'id is required' })
  }

  const jobs = await db
    .select()
    .from(generationJobs)
    .where(eq(generationJobs.dishId, id))
    .orderBy(desc(generationJobs.createdAt))

  return jobs
})

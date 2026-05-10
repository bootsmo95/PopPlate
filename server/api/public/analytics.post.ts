import { db } from '../../database/index'
import { analyticsEvents } from '../../database/schema'

const VALID_EVENT_TYPES = ['page_open', 'viewer_loaded', 'ar_launch_clicked'] as const
type EventType = (typeof VALID_EVENT_TYPES)[number]

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { eventType, dishId, restaurantId, sessionId, userAgent, referrer } = body ?? {}

  // Basic validation
  if (!dishId) {
    throw createError({ statusCode: 400, message: 'dishId is required' })
  }
  if (!eventType) {
    throw createError({ statusCode: 400, message: 'eventType is required' })
  }
  if (!VALID_EVENT_TYPES.includes(eventType as EventType)) {
    throw createError({
      statusCode: 400,
      message: `eventType must be one of: ${VALID_EVENT_TYPES.join(', ')}`,
    })
  }

  await db.insert(analyticsEvents).values({
    dishId: dishId as string,
    restaurantId: restaurantId as string | undefined,
    eventType: eventType as string,
    sessionId: sessionId as string | undefined,
    userAgent: userAgent as string | undefined,
    referrer: referrer as string | undefined,
  })

  return { ok: true }
})

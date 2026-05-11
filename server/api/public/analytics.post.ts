import { db } from '../../database/index'
import { analyticsEvents, dishes } from '../../database/schema'
import { eq } from 'drizzle-orm'

const VALID_EVENT_TYPES = ['page_open', 'viewer_loaded', 'ar_launch_clicked'] as const
type EventType = (typeof VALID_EVENT_TYPES)[number]

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 30

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  entry.count++
  return entry.count <= RATE_LIMIT_MAX
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  if (!checkRateLimit(ip)) {
    throw createError({ statusCode: 429, message: 'Too many requests' })
  }

  const body = await readBody(event)

  const { eventType, dishId, sessionId, userAgent, referrer } = body ?? {}

  if (!dishId || typeof dishId !== 'string') {
    throw createError({ statusCode: 400, message: 'dishId is required' })
  }
  if (!eventType || typeof eventType !== 'string') {
    throw createError({ statusCode: 400, message: 'eventType is required' })
  }
  if (!VALID_EVENT_TYPES.includes(eventType as EventType)) {
    throw createError({
      statusCode: 400,
      message: `eventType must be one of: ${VALID_EVENT_TYPES.join(', ')}`,
    })
  }

  const [dish] = await db
    .select({ id: dishes.id, restaurantId: dishes.restaurantId })
    .from(dishes)
    .where(eq(dishes.id, dishId))
    .limit(1)
  if (!dish) {
    throw createError({ statusCode: 404, message: 'Dish not found' })
  }

  await db.insert(analyticsEvents).values({
    dishId,
    restaurantId: dish.restaurantId,
    eventType,
    sessionId: typeof sessionId === 'string' ? sessionId : null,
    userAgent: typeof userAgent === 'string' ? userAgent : null,
    referrer: typeof referrer === 'string' ? referrer : null,
  })

  return { ok: true }
})

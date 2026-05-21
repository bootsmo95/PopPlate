import { db } from '../database/index'
import { generationJobs } from '../database/schema'
import { eq, gte, count, and } from 'drizzle-orm'

/**
 * Compute the start of the current billing cycle based on an anchor date
 * (typically the user's signup date).
 *
 * The cycle resets on the anchor's day-of-month each month.
 * If the anchor day exceeds the number of days in the relevant month,
 * it clamps to the last day of that month.
 */
export function getBillingCycleStart(anchorDate: Date): Date {
  const now = new Date()
  const anchorDay = anchorDate.getUTCDate()
  const currentYear = now.getUTCFullYear()
  const currentMonth = now.getUTCMonth()
  const todayDay = now.getUTCDate()

  let cycleYear: number
  let cycleMonth: number

  if (todayDay >= anchorDay) {
    // Cycle started this month
    cycleYear = currentYear
    cycleMonth = currentMonth
  } else {
    // Cycle started last month
    if (currentMonth === 0) {
      cycleYear = currentYear - 1
      cycleMonth = 11
    } else {
      cycleYear = currentYear
      cycleMonth = currentMonth - 1
    }
  }

  // Clamp anchor day to the last day of the cycle month
  const daysInCycleMonth = new Date(Date.UTC(cycleYear, cycleMonth + 1, 0)).getUTCDate()
  const clampedDay = Math.min(anchorDay, daysInCycleMonth)

  return new Date(Date.UTC(cycleYear, cycleMonth, clampedDay))
}

/**
 * Count generation jobs for a user since a given cycle start date.
 * Counts ALL jobs regardless of status, since the generation was consumed
 * regardless of outcome.
 */
export async function getMonthlyGenerationCount(userId: string, cycleStart: Date): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(generationJobs)
    .where(
      and(
        eq(generationJobs.requestedByUserId, userId),
        gte(generationJobs.createdAt, cycleStart),
      ),
    )

  return result?.count ?? 0
}

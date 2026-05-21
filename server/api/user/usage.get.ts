import { requireAuth, getDbUser } from '../../utils/auth'
import { hasUnlimitedAccess } from '../../utils/access'
import { getTierLimits } from '../../utils/tiers'
import { getBillingCycleStart, getMonthlyGenerationCount } from '../../utils/generation-usage'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)
  const dbUser = await getDbUser(user.id)

  if (!dbUser) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  const anchorDate = dbUser.createdAt
  const cycleStart = getBillingCycleStart(anchorDate)
  const used = await getMonthlyGenerationCount(user.id, cycleStart)
  const limits = getTierLimits(user.accountTier)
  const unlimited = hasUnlimitedAccess(user)

  return {
    used,
    limit: unlimited ? null : limits.maxGenerationsPerMonth,
    tierName: user.accountTier,
    cycleStart: cycleStart.toISOString(),
    unlimited,
  }
})

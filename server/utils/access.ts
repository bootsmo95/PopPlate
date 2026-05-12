import type { SessionUser } from './auth'

export function hasUnlimitedAccess(user: SessionUser): boolean {
  return user.role === 'admin'
}

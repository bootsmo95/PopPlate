interface AuthUser {
  id: string
  email: string
  role: string
  accountTier: string
}

export function useAuth() {
  const { user, loggedIn, fetch: fetchSession, clear } = useUserSession()
  const isAuthenticated = computed(() => loggedIn.value)
  const authUser = computed(() => (user.value as AuthUser | null) ?? null)
  const accountTier = computed(() => authUser.value?.accountTier ?? 'free')

  async function login(next = '/platform/dishes'): Promise<void> {
    await navigateTo(`/api/auth/authentik/login?next=${encodeURIComponent(next)}`, {
      external: true,
    })
  }

  async function signup(next = '/platform/settings'): Promise<void> {
    await navigateTo(`/api/auth/authentik/signup?next=${encodeURIComponent(next)}`, {
      external: true,
    })
  }

  async function logout(): Promise<void> {
    await clear()
    await navigateTo('/api/auth/authentik/logout', { external: true })
  }

  async function fetchUser(): Promise<AuthUser | null> {
    await fetchSession()
    return authUser.value
  }

  return {
    user: authUser,
    isAuthenticated,
    accountTier,
    login,
    signup,
    logout,
    fetchUser,
  }
}

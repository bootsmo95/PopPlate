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

  async function login(email: string, password: string): Promise<void> {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    await fetchSession()
  }

  async function logout(): Promise<void> {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore logout errors — session may already be cleared
    } finally {
      await clear()
      await navigateTo('/admin/login')
    }
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
    logout,
    fetchUser,
  }
}

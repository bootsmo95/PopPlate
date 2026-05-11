interface AuthUser {
  email: string
  role: string
}

export function useAuth() {
  const { user, loggedIn, fetch: fetchSession, clear } = useUserSession()
  const isAuthenticated = computed(() => loggedIn.value)

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
    return (user.value as AuthUser | null) ?? null
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    fetchUser,
  }
}

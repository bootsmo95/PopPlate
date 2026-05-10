interface AuthUser {
  email: string
  role: string
}

const user = ref<AuthUser | null>(null)

export function useAuth() {
  const isAuthenticated = computed(() => user.value !== null)

  async function login(email: string, password: string): Promise<void> {
    const data = await $fetch<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    user.value = data.user
  }

  async function logout(): Promise<void> {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore logout errors — session may already be cleared
    } finally {
      user.value = null
      await navigateTo('/admin/login')
    }
  }

  async function fetchUser(): Promise<AuthUser | null> {
    try {
      const data = await $fetch<{ user: AuthUser }>('/api/auth/session')
      user.value = data.user
      return data.user
    } catch {
      user.value = null
      return null
    }
  }

  return {
    user: readonly(user),
    isAuthenticated,
    login,
    logout,
    fetchUser,
  }
}

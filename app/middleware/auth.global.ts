export default defineNuxtRouteMiddleware(async (to) => {
  // Only protect /platform/* routes
  if (!to.path.startsWith('/platform')) return

  // Allow auth pages through without auth check
  if (to.path === '/platform/login' || to.path === '/platform/signup') {
    const { loggedIn } = useUserSession()

    if (loggedIn.value)
      return navigateTo('/platform/dishes')

    return
  }

  const { loggedIn } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo('/platform/login')
  }
})

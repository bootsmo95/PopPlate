export default defineNuxtRouteMiddleware(async (to) => {
  // Only protect /admin/* routes
  if (!to.path.startsWith('/admin')) return

  // Allow auth pages through without auth check
  if (to.path === '/admin/login' || to.path === '/admin/signup') {
    const { loggedIn } = useUserSession()

    if (loggedIn.value)
      return navigateTo('/admin/dishes')

    return
  }

  const { loggedIn } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo('/admin/login')
  }
})

export default defineNuxtRouteMiddleware(async (to) => {
  // Only protect /admin/* routes
  if (!to.path.startsWith('/admin')) return

  // Allow /admin/login through without auth check
  if (to.path === '/admin/login') return

  const { loggedIn } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo('/admin/login')
  }
})

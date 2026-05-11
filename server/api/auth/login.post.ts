export default defineEventHandler(async (event) => {
  throw createError({
    statusCode: 410,
    message: 'Password login is disabled. Please sign in with Authentik.',
  })
})

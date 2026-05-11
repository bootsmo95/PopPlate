export default defineEventHandler(async (event) => {
  throw createError({
    statusCode: 410,
    message: 'Password signup is disabled. Please create users through Authentik.',
  })
})

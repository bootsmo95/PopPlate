// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-10',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', 'nuxt-auth-utils'],

  runtimeConfig: {
    public: {
      appUrl: 'http://localhost:3000',
      apiUrl: 'http://localhost:3000',
      defaultRestaurantId: '',
    },
  },

  typescript: {
    strict: true,
  },

  vue: {
    compilerOptions: {
      isCustomElement: (tag: string) => tag === 'model-viewer',
    },
  },

  ssr: true,
})

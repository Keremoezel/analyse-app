// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
  ],
  devtools: { enabled: true },
  compatibilityDate: '2025-12-11',

  // Vercel deployment preset
  nitro: {
    preset: 'vercel',
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  // Runtime config
  runtimeConfig: {
    // Server-side only (kept secret)
    adminPassword: '', // NUXT_ADMIN_PASSWORD variables automatically populate this
    // Public (exposed to client)
    public: {
      // client side keys
    }
  },
})

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
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

  // Runtime config for Vercel environment variables
  runtimeConfig: {
    // Server-side only
    postgres: {
      url: process.env.POSTGRES_URL,
    },
    blob: {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    },
    kv: {
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    },
  },
})

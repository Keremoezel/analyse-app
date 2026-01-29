// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
  ],
  devtools: { enabled: true },
  compatibilityDate: '2025-12-11',


  app: {
    head: {
      title: 'DISG Persönlichkeitstest',
      htmlAttrs: {
        lang: 'de',
      },
      link: [
        { rel: 'icon', type: 'image/png', href: '/gemini.png' },
      ],
    },
  },

  // Vercel deployment preset
  nitro: {
    preset: 'vercel',
    serverAssets: [
      {
        baseName: 'templates',
        dir: './server/templates'
      }
    ]
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  // Runtime config
  runtimeConfig: {
    // Server-side only (kept secret)
    adminPassword: '',

    // Public (exposed to client)
    public: {
      // client side keys
    }
  },
})

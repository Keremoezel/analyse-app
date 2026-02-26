// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
  ],
  devtools: { enabled: true },
  compatibilityDate: '2025-12-11',

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'power4-people Kurzanalyse',
      htmlAttrs: {
        lang: 'de',
      },
      link: [
        { rel: 'icon', type: 'image/png', href: '/gemini.png' },
      ],
    },
  },

  // Node.js server deployment (Hetzner)
  nitro: {
    preset: 'node-server',
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
    adminPassword: process.env.NUXT_ADMIN_PASSWORD || '',
    emailFromNoreply: process.env.EMAIL_FROM_NOREPLY || '',
    emailFromSupport: process.env.EMAIL_FROM_SUPPORT || '',
    emailApiKey: process.env.EMAIL_API_KEY || '',
    emailAdminRecipient: process.env.EMAIL_ADMIN_RECIPIENT || '',
    testCheatcode: process.env.TEST_CHEATCODE || '',
    allowedEmails: process.env.ALLOWED_EMAILS || '',

    // Public (exposed to client)
    public: {
      testCheatcode: '',
    }
  },
})

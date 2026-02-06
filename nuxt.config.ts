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
    ],
    vercel: {
      config: {
        // @ts-ignore - Nitro/Vercel functions config
        functions: {
          'server/api/email/*.post.ts': {
            memory: 1024,
            maxDuration: 30
          }
        }
      }
    }
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
    emailFromNoreply: process.env.EMAIL_FROM_NOREPLY || '',
    emailFromSupport: process.env.EMAIL_FROM_SUPPORT || '',
    emailApiKey: process.env.EMAIL_API_KEY || '',
    emailAdminRecipient: process.env.EMAIL_ADMIN_RECIPIENT || '',

    // Public (exposed to client)
    public: {
      // client side keys
    }
  },
})

import tailwindcss from "@tailwindcss/vite";
import {APP_NAME} from "./constants";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {enabled: true},

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  app: {
    // TODO - Setup: Change meta tags and add favicon
    head: {
      titleTemplate: `%s - ${APP_NAME}`,
      meta: [
        {name: 'viewport', content: 'width=device-width, initial-scale=1'},
        {name: 'og:title', content: 'Webapp boilerplate'},
        {name: 'description', content: 'Kickstart your Nuxt app.'},
        {name: 'og:description', content: 'Kickstart your Nuxt app.'},
        {name: 'msapplication-TileColor', content: '#ffffff'},
        {name: 'theme-color', content: '#ffffff'},
      ],
      link: [
        {rel: 'icon', type: 'image/x-icon', href: '/logo.svg'},

        // Generate using https://realfavicongenerator.net/
        // {rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png'},
        // {rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon/favicon-32x32.png'},
        // {rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon/favicon-16x16.png'},
        // {rel: 'manifest', href: '/favicon/site.webmanifest'},
        // {rel: 'mask-icon', href: '/favicon/safari-pinned-tab.svg', color: '#ffffff'},
      ],
    },
  },

  css: ['../assets/css/tailwind.css'],

  runtimeConfig: {
    public: {
      baseUrl: 'http://localhost:3000',
      stripeKey: '',
    },
    stripeSecretKey: ''
  },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/supabase',
    '@vueuse/nuxt',
    // '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    'dayjs-nuxt',
    'shadcn-nuxt',
  ],

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: [
        '/confirm-registration', '/registratie-bevestigen',
        '/password-recovery', '/wachtwoord-herstellen',
        '/sign-up', '/registreren',
        '/update-password', '/wachtwoord-bijwerken',
      ],
    }
  },

  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },

  // colorMode: {
  //   preference: 'light',
  //   classSuffix: '',
  // },

  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    locales: [
      {
        code: 'en',
        name: 'English',
        files: [
          'en/common.ts',
          'en/404.ts',
          'en/account.ts',
          'en/authentication.ts',
          'en/home.ts',
          'en/feedback.ts',
          'en/legal.ts',
          'en/pricing.ts',
        ]
      },
      {
        code: 'nl',
        name: 'Nederlands',
        files: [
          'nl/common.ts',
          'nl/404.ts',
          'nl/account.ts',
          'nl/authentication.ts',
          'nl/home.ts',
          'nl/feedback.ts',
          'nl/legal.ts',
          'nl/pricing.ts',
        ]
      },
    ],
    customRoutes: 'config',
    pages: {
      account: {
        en: '/account',
        nl: '/account',
      },
      'collectionId-memories-slug': {
        en: '/[collectionId]/memories/[slug]',
        nl: '/[collectionId]/herinneringen/[slug]',
      },
      login: {
        en: '/login',
        nl: '/login',
      },
      'collectionId-memories-create': {
        en: '/[collectionId]/memories/create',
        nl: '/[collectionId]/herinneringen/aanmaken',
      },
      'memories-[slug]-edit': {
        en: '/[collectionId]/memories/[slug]/edit',
        nl: '/[collectionId]/herinneringen/[slug]/bewerken',
      },
      onboarding: {
        en: '/onboarding',
        nl: '/introductie',
      },
      'password-recovery': {
        en: '/password-recovery',
        nl: '/wachtwoord-herstellen',
      },
      pricing: {
        en: '/pricing',
        nl: '/prijzen',
      },
      'sign-up': {
        en: '/sign-up',
        nl: '/registreren',
      },
      'update-password': {
        en: '/update-password',
        nl: '/wachtwoord-bijwerken',
      },
    },
  },

  dayjs: {
    locales: ['en', 'nl'],
    defaultLocale: 'en',
    plugins: ['relativeTime', 'utc', 'timezone'],
  },

  compatibilityDate: '2024-12-17',
})
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
    '@nuxtjs/color-mode',
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

  colorMode: {
    classSuffix: '',
  },

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
          'en/customers.ts',
          'en/dashboard.ts',
          'en/feedback.ts',
          'en/legal.ts',
          'en/pricing.ts',
          'en/settings.ts',
          'en/users.ts'
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
          'nl/customers.ts',
          'nl/dashboard.ts',
          'nl/feedback.ts',
          'nl/legal.ts',
          'nl/pricing.ts',
          'nl/settings.ts',
          'nl/users.ts'
        ]
      },
    ],
    customRoutes: 'config',
    pages: {
      account: {
        en: '/account',
        nl: '/account',
      },
      customers: {
        en: '/customers',
        nl: '/klanten',
      },
      'customers-create': {
        en: '/customers/create',
        nl: '/klanten/aanmaken',
      },
      'customers-[id]': {
        en: '/customers/[id]',
        nl: '/klanten/[id]',
      },
      'customers-[id]-edit': {
        en: '/customers/[id]/edit',
        nl: '/klanten/[id]/bewerken',
      },
      login: {
        en: '/login',
        nl: '/login',
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
      settings: {
        en: '/settings',
        nl: '/instellingen',
      },
      'update-password': {
        en: '/update-password',
        nl: '/wachtwoord-bijwerken',
      },
      users: {
        en: '/users',
        nl: '/gebruikers',
      },
      'users-create': {
        en: '/users/create',
        nl: '/gebruikers/aanmaken',
      },
      'users-[id]': {
        en: '/users/[id]',
        nl: '/gebruikers/[id]',
      },
      'users-[id]-edit': {
        en: '/users/[id]/edit',
        nl: '/gebruikers/[id]/bewerken',
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
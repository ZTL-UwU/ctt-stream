// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@vueuse/nuxt',
    '@nuxt/image',
    '@nuxt/icon',
    '@nuxtjs/color-mode',
  ],

  colorMode: {
    classSuffix: '',
    disableTransition: true,
    fallback: 'light',
    storage: 'cookie',
  },

  css: ['~/assets/css/main.css'],

  icon: {
    clientBundle: {
      scan: true,
      sizeLimitKb: 512,
    },
  },

  fonts: {
    families: [
      { name: 'shu hei', provider: 'local' },
    ],
  },

  imports: {
    presets: [
      {
        from: '@tanstack/vue-query',
        imports: ['useMutation', 'useQuery', 'useQueryClient', 'skipToken'],
      },
    ],
  },

  build: {
    transpile: ['trpc-nuxt'],
  },

  compatibilityDate: '2024-10-03',
});

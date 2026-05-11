// https://nuxt.com/docs/api/configuration/nuxt-config

/** Dev : polling optionnel si erreurs EPERM sur la surveillance des fichiers (variable CHOKIDAR_USEPOLLING, cf. doc Chokidar). */
const devWatchUsePolling = process.env.CHOKIDAR_USEPOLLING === 'true'
const devWatchInterval = Number(process.env.CHOKIDAR_INTERVAL) || 1000

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // App SPA: tout l'etat (auth, panier, settings) vit dans localStorage/Pinia,
  // donc le SSR ne peut pas produire le meme HTML que le client et provoque
  // des "Hydration completed but contains mismatches". Mode SPA = un seul rendu.
  ssr: false,

  // Sans SSR, pas besoin du manifest experimental ; sinon Vite peut tenter de
  // résoudre `#app-manifest` sur le bundle client → erreur "Failed to resolve import".
  experimental: {
    appManifest: false,
  },

  vite: {
    server: {
      watch: {
        usePolling: devWatchUsePolling,
        interval: devWatchInterval,
      },
    },
  },

  /** Watchers Nuxt (chokidar), même bascule que Vite ci‑dessus. */
  watchers: {
    chokidar: {
      usePolling: devWatchUsePolling,
      interval: devWatchInterval,
      ignorePermissionErrors: true,
    },
  },

  modules: ['@pinia/nuxt', '@nuxtjs/i18n'],

  i18n: {
    locales: [
      { code: 'fr', name: 'Francais', file: 'fr.json', iso: 'fr-FR' },
      { code: 'en', name: 'English', file: 'en.json', iso: 'en-US' }
    ],
    defaultLocale: 'fr',
    langDir: 'locales',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      fallbackLocale: 'fr'
    }
  },
  runtimeConfig: {
    public: {
      // Valeur locale par défaut. Nuxt override automatiquement via la variable
      // d'environnement NUXT_PUBLIC_API_BASE (sans toucher ce fichier).
      // - Local  : défini dans .env.local  → http://localhost:8000/api
      // - Vercel : défini dans le dashboard → https://gateway.nadom.co/api
      apiBase: "http://localhost:8000/api",
      whatsapp: "+2250714158172",
      logo: "/logo_nadom.png",
      siteName: "NADOM",
      pusherKey: "a01268b9f632bda2891d",
      pusherCluster: "ap2"
    }
  },
  css: [
    '~/assets/scss/style.scss',
    'flag-icons/css/flag-icons.min.css',
  ],

  app: {
    head: {
      title: 'NADOM - Import-Export Chine | Personal Shopping',
      titleTemplate: '%s | NADOM',
      htmlAttrs: { class: "light scroll-smooth", dir: 'ltr', lang: 'fr' },

      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
        },
        { id: 'description', name: 'description', content: 'NADOM - Votre partenaire pour l\'import-export avec la Chine. Personal shopping, expedition, visa et guides professionnels.' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'keywords', content: 'import export, chine, personal shopping, expedition, visa chine, guide chine, sourcing' },
      ],
      link: [

        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css',
        },
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css',
        },
        // {
        //   rel: 'stylesheet',
        //   href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css',
        // },
        {
          rel: 'stylesheet',
          href: 'https://unpkg.com/swiper/swiper-bundle.min.css',
        },
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
        },
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/lightgallery/2.8.3/css/lightgallery.min.css',
        },
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/dropzone/5.9.3/dropzone.min.css',
        },
        {
          rel: 'stylesheet',
          href: 'https://unpkg.com/vue-multiselect/dist/vue-multiselect.min.css',
        }
      ],

      script: [
        // Bootstrap est charge via plugins/bootstrap.client.ts (paquet npm),
        // pas via CDN, pour eviter la race onMounted vs script-load.
        { src: 'https://cdn.jsdelivr.net/npm/apexcharts' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.min.js' },
      ],

    },
  },
})

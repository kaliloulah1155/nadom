// https://nuxt.com/docs/api/configuration/nuxt-config
// Modèle : renommer en nuxt.config.ts ou fusionner avec la config locale.

const devWatchUsePolling = process.env.CHOKIDAR_USEPOLLING === 'true'
const devWatchInterval = Number(process.env.CHOKIDAR_INTERVAL) || 1000

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // SPA: l'état (auth, panier, settings) vit dans localStorage/Pinia → pas de SSR.
  ssr: false,
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
    // Pré-bundle les libs importées seulement sur certaines pages. Sinon Vite les
    // découvre à la navigation → re-optimisation + rechargement complet de la page.
    optimizeDeps: {
      include: [
        'quill',
        'vue-multiselect',
        'vue-countup-v3',
        'vue-chartjs',
        'chart.js',
        'vue-easy-lightbox',
        'multi-range-slider-vue',
        'vue3-google-map',
        'laravel-echo',
        'pusher-js',
        'swiper',
        'dropzone',
      ],
    },
  },

  watchers: {
    chokidar: {
      usePolling: devWatchUsePolling,
      interval: devWatchInterval,
      ignorePermissionErrors: true,
    },
  },

  modules: ['@pinia/nuxt', '@nuxtjs/i18n', 'nuxt-site-config', '@nuxtjs/sitemap'],

  // Base SEO : URL de reference pour le sitemap et les liens canoniques generes
  // par les modules. nadom.co reste la seule adresse indexable (voir
  // server/middleware/seo-noindex-guard.ts pour rc.nadom.co et /admin).
  site: {
    url: 'https://nadom.co',
    name: 'NADOM',
  },

  sitemap: {
    exclude: ['/admin/**', '/login', '/register', '/dashboard/**', '/profile', '/paiement/**', '/error'],
  },

  i18n: {
    locales: [
      { code: 'fr', name: 'Français', file: 'fr.json', language: 'fr-FR' },
      { code: 'en', name: 'English', file: 'en.json', language: 'en-US' },
      { code: 'zh', name: '中文', file: 'zh.json', language: 'zh-CN' }
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
      // API Laravel (avec /api). Prod: https://gateway.nadom.co/api · Local: http://localhost:8000/api
      apiBase: "https://gateway.nadom.co/api",
      // Host du backend qui sert les fichiers /storage (images, PDF…), SANS /api.
      // DOIT pointer vers le host qui héberge réellement /storage en prod.
      apiFile: "https://gateway.nadom.co",
      // Override optionnel du host fichiers. Vide → on utilise apiFile (puis apiBase sans /api).
      storageBase: "",
      whatsapp: "+2250714158172",
      logo: "/logo_nadom.png",
      siteName: "NADOM",
      pusherKey: "a01268b9f632bda2891d",
      pusherCluster: "ap2",
      // Frais GeniusPay désactivés : prix client = net NADOM.
      geniuspayFeeRate: 0,
      geniuspayFixedFee: 0,
      geniuspayCommissionRate: 0,
      geniuspayPayoutFeeFixed: 0,
      geniuspayPayoutFeeRate: 0
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
        // Favicon declare explicitement : le fallback implicite /favicon.ico ne
        // resiste pas au reverse proxy en prod (et le fichier .ico contient en
        // realite un PNG, type MIME incoherent selon le serveur).
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'shortcut icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/favicon.png' },
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css',
        },
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css',
        },
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
        { src: 'https://cdn.jsdelivr.net/npm/apexcharts' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.min.js' },
      ],
    },
  },
})

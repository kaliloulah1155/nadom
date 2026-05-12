<template>
  <div>
    <!-- Marquee -->
    <Marquee v-if="marqueeText" :text="marqueeText" />

    <!-- Hero Section -->
    <section class="hero-section position-relative overflow-hidden">
      <div class="hero-bg"></div>
      <div class="container position-relative py-5">
        <div class="row align-items-center min-vh-75">
          <div class="col-lg-6">
            <span class="badge bg-warning text-dark mb-3 px-3 py-2">
              <i class="bi bi-star-fill me-1"></i>{{ t('home.heroBadge') }}
            </span>
            <h1 class="display-4 fw-bold text-white mb-4">
              {{ t('home.heroTitle') }}
            </h1>
            <p class="lead text-white opacity-75 mb-4">
              {{ t('home.heroSubtitle') }}
            </p>
            <div class="d-flex gap-3 flex-wrap">
              <NuxtLink to="/personal-shopping/new" class="btn btn-primary btn-lg">
                <i class="bi bi-bag-plus me-2"></i>{{ t('home.ctaStart') }}
              </NuxtLink>
              <NuxtLink to="/import-export/tracking" class="btn btn-outline-light btn-lg">
                <i class="bi bi-box-seam me-2"></i>{{ t('nav.trackPackage') }}
              </NuxtLink>
            </div>
            <!-- Trust badges -->
            <div class="d-flex gap-4 mt-4 pt-3 border-top border-light border-opacity-25">
              <div>
                <div class="fw-bold text-white">500+</div>
                <small class="text-white opacity-75">{{ t('home.statsClients') }}</small>
              </div>
              <div>
                <div class="fw-bold text-white">15+</div>
                <small class="text-white opacity-75">{{ t('home.statsCountries') }}</small>
              </div>
              <div>
                <div class="fw-bold text-white">4.8/5</div>
                <small class="text-white opacity-75"><i class="bi bi-star-fill text-warning"></i></small>
              </div>
            </div>
          </div>
          <div class="col-lg-6 d-none d-lg-block">
            <img src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600"
                 alt="Import Export"
                 class="img-fluid rounded-4 shadow-lg" />
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="py-5 bg-light">
      <div class="container">
        <div class="text-center mb-5">
          <span class="badge bg-primary-subtle text-primary mb-2">{{ t('home.servicesBadge') }}</span>
          <h2 class="fw-bold">{{ t('home.servicesTitle') }}</h2>
          <p class="text-muted">{{ t('home.servicesSubtitle') }}</p>
        </div>

        <p v-if="servicesEmptyFromApi" class="text-center text-muted mb-0">
          Aucun service publié pour le moment.
        </p>
        <div v-else class="row g-4">
          <div v-for="service in services" :key="service.id" class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 shadow-sm hover-card">
              <div class="card-body p-4">
                <div class="service-icon mb-3">
                  <i :class="service.icon" class="fs-1 text-primary"></i>
                </div>
                <h5 class="card-title">{{ service.name }}</h5>
                <div class="card-text text-muted service-desc mb-3" v-html="service.descriptionHtml"></div>
                <ul class="list-unstyled mb-0">
                  <li v-for="(featureHtml, idx) in service.featureBlocks" :key="idx" class="mb-1">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    <small class="service-feature-line d-inline-block" v-html="featureHtml"></small>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-5 position-relative">
      <div class="section-pattern"></div>
      <div class="container position-relative">
        <div class="text-center mb-5">
          <span class="badge bg-success-subtle text-success mb-2">{{ t('home.howItWorksBadge') }}</span>
          <h2 class="fw-bold">{{ t('home.howItWorks') }}</h2>
          <p class="text-muted">{{ t('home.howItWorksSubtitle') }}</p>
        </div>

        <div class="row">
          <div v-for="(step, index) in steps" :key="index" class="col-6 col-lg text-center mb-4 mb-lg-0">
            <div class="step-number mx-auto mb-3">{{ index + 1 }}</div>
            <h6>{{ step.title }}</h6>
            <small class="text-muted">{{ step.description }}</small>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="py-5 bg-light">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="fw-bold">{{ t('home.categoriesTitle') }}</h2>
          <p class="text-muted">{{ t('home.categoriesSubtitle') }}</p>
        </div>

        <div class="row g-3">
          <div v-for="category in categories" :key="category.uuid" class="col-6 col-md-4 col-lg-3">
            <NuxtLink :to="`/personal-shopping?category=${category.slug}`" class="text-decoration-none">
              <div class="card h-100 border-0 shadow-sm text-center hover-card">
                <div class="card-body py-4">
                  <i :class="categoryIcon(category)" class="fs-2 mb-2 text-primary"></i>
                  <h6 class="mb-0">{{ category.label }}</h6>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-5 bg-primary position-relative overflow-hidden">
      <div class="stats-pattern"></div>
      <div class="container position-relative">
        <div class="row text-center">
          <div class="col-6 col-md-3 mb-4 mb-md-0">
            <div class="display-4 fw-bold text-white">500+</div>
            <p class="mb-0 text-white opacity-75">{{ t('home.statsClients') }}</p>
          </div>
          <div class="col-6 col-md-3 mb-4 mb-md-0">
            <div class="display-4 fw-bold text-white">1200+</div>
            <p class="mb-0 text-white opacity-75">{{ t('home.statsPackages') }}</p>
          </div>
          <div class="col-6 col-md-3">
            <div class="display-4 fw-bold text-white">15+</div>
            <p class="mb-0 text-white opacity-75">{{ t('home.statsCountries') }}</p>
          </div>
          <div class="col-6 col-md-3">
            <div class="display-4 fw-bold text-white">5+</div>
            <p class="mb-0 text-white opacity-75">{{ t('home.statsYears') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Recent Blog Posts -->
    <section class="py-5">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <span class="badge bg-info-subtle text-info mb-2">{{ t('nav.blog') }}</span>
            <h2 class="fw-bold mb-0">{{ t('home.latestArticles') }}</h2>
            <p class="text-muted mb-0">{{ t('blog.subtitle') }}</p>
          </div>
          <NuxtLink to="/resources/blog" class="btn btn-outline-primary">
            {{ t('common.viewAll') }} <i class="bi bi-arrow-right ms-1"></i>
          </NuxtLink>
        </div>

        <div class="row g-4">
          <div v-for="post in recentPosts" :key="post.id" class="col-md-6 col-lg-3">
            <div class="card h-100 border-0 shadow-sm">
              <img :src="resolveImage(post.image)" class="card-img-top" :alt="post.title_fr || ''" style="height: 160px; object-fit: cover;" />
              <div class="card-body">
                <span v-if="post.category" class="badge bg-primary-subtle text-primary mb-2">{{ post.category }}</span>
                <h6 class="card-title">{{ post[`title_${locale}`] || post.title_fr }}</h6>
                <p class="card-text small text-muted">{{ truncate(post[`excerpt_${locale}`] || post.excerpt_fr || '', 80) }}</p>
              </div>
              <div class="card-footer bg-transparent border-0">
                <NuxtLink :to="`/resources/blog/${post.slug}`" class="btn btn-sm btn-link p-0">
                  {{ t('blog.readMore') }} <i class="bi bi-arrow-right"></i>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-5 bg-dark position-relative overflow-hidden">
      <div class="cta-pattern"></div>
      <div class="container text-center position-relative">
        <h2 class="fw-bold mb-3 text-white">{{ t('home.ctaTitle') }}</h2>
        <p class="lead mb-4 text-white opacity-75">
          {{ t('home.ctaSubtitle') }}
        </p>
        <div class="d-flex justify-content-center gap-3 flex-wrap">
          <NuxtLink to="/personal-shopping/new" class="btn btn-primary btn-lg">
            {{ t('personalShopping.newRequest') }}
          </NuxtLink>
          <a :href="`https://wa.me/${useRuntimeConfig().public.whatsapp}`" target="_blank" class="btn btn-success btn-lg">
            <i class="bi bi-whatsapp me-2"></i>{{ t('common.contactUs') }}
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useBlogStore } from '~/stores/blog'
import { usePersonalShoppingStore } from '~/stores/personalShopping'
import { useGlobalSettingsStore } from '~/stores/globalSettings'
import { useHomeServicesStore } from '~/stores/homeServices'
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({
  layout: 'default'
})

const { t, tm, rt, locale } = useI18n()
const blogStore = useBlogStore()
const psStore = usePersonalShoppingStore()
const settingsStore = useGlobalSettingsStore()
const homeServicesStore = useHomeServicesStore()
const { truncate } = useFormatters()
const config = useRuntimeConfig()

const marqueeText = computed(() => settingsStore.getValue('home_marquee', ''))

const escapePlain = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const plainToHtmlParagraph = (s: string) => (s ? `<p>${escapePlain(s)}</p>` : '')

function stripInnerText(html: string) {
  return String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const SERVICE_KEYS = [
  { id: 'personal-shopping', icon: 'bi-bag-check', key: 'personalShopping' },
  { id: 'shipping', icon: 'bi-box-seam', key: 'shipping' },
  { id: 'visa', icon: 'bi-passport', key: 'visa' },
  { id: 'guide', icon: 'bi-person-badge', key: 'guide' }
]

const servicesFromApi = computed(() => {
  const rows = homeServicesStore.publicItems
  const fr = locale.value === 'fr'
  return rows.map(row => {
    const title = fr ? row.title_fr : (row.title_en || row.title_fr)
    const desc = fr ? row.description_fr : (row.description_en || row.description_fr)
    const feats = fr ? row.features_fr : (row.features_en || row.features_fr)
    const rawList = Array.isArray(feats) ? feats.filter((x): x is string => typeof x === 'string') : []
    const featureBlocks = rawList.map(f => f || '').filter(f => stripInnerText(f))
    return {
      id: row.slug || row.id,
      icon: row.icon || 'bi-grid',
      name: title || '',
      descriptionHtml: desc || '',
      featureBlocks
    }
  })
})

const servicesEmptyFromApi = computed(
  () =>
    homeServicesStore.publicFetched &&
    !homeServicesStore.publicFetchFailed &&
    homeServicesStore.publicItems.length === 0
)

const services = computed(() => {
  if (homeServicesStore.publicFetched && !homeServicesStore.publicFetchFailed) {
    return servicesFromApi.value
  }

  return SERVICE_KEYS.map(s => {
    const featuresRaw = tm(`services.${s.key}.features`) as any
    const plainFeatures = Array.isArray(featuresRaw) ? featuresRaw.slice(0, 3).map((f: any) => rt(f)) : []
    return {
      id: s.id,
      icon: s.icon,
      name: t(`services.${s.key}.title`),
      descriptionHtml: plainToHtmlParagraph(t(`services.${s.key}.description`)),
      featureBlocks: plainFeatures.map((p: string) => plainToHtmlParagraph(p))
    }
  })
})

const categories = computed(() =>
  psStore.categories.filter((c: any) => (c.slug || '').toUpperCase() === 'POD')
)

const ICONS = ['bi-phone', 'bi-bag', 'bi-house', 'bi-heart', 'bi-bicycle', 'bi-gift', 'bi-car-front', 'bi-gear', 'bi-cup-hot', 'bi-lamp', 'bi-hospital', 'bi-scissors']
const categoryIcon = (cat: any) => cat.icon || ICONS[(Number(cat.id) || 0) % ICONS.length] || 'bi-box'

const resolveImage = (img: string | null) => {
  if (!img) return 'https://placehold.co/400x200?text=NADOM'
  if (/^https?:\/\//i.test(img)) return img
  return (config.public.apiBase as string).replace('/api', '') + '/storage/' + String(img).replace(/^\/+/, '')
}

const steps = computed(() => [
  { title: t('home.steps.step1'), description: t('home.steps.step1Desc') },
  { title: t('home.steps.step2'), description: t('home.steps.step2Desc') },
  { title: t('home.steps.step3'), description: t('home.steps.step3Desc') },
  { title: t('home.steps.step4'), description: t('home.steps.step4Desc') },
  { title: t('home.steps.step5'), description: t('home.steps.step5Desc') }
])

await Promise.all([
  blogStore.fetchPosts({ page: 1, limit: 4, is_published: true }),
  psStore.fetchCategories({ page: 1, limit: 100, slug: 'POD' }),
  settingsStore.fetchAll(),
  homeServicesStore.fetchPublic(),
])

const recentPosts = computed(() => blogStore.getRecentPosts(4))
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  min-height: 80vh;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200') center/cover;
  opacity: 0.1;
}

.min-vh-75 {
  min-height: 75vh;
}

.hover-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
}

.service-desc :deep(p:last-child),
.service-feature-line :deep(p:last-child) {
  margin-bottom: 0;
}

.service-desc :deep(p),
.service-feature-line :deep(p) {
  margin-bottom: 0.35rem;
}

.service-icon {
  width: 70px;
  height: 70px;
  background: var(--bs-primary);
  background: linear-gradient(135deg, rgba(var(--bs-primary-rgb), 0.1) 0%, rgba(var(--bs-primary-rgb), 0.2) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-number {
  width: 60px;
  height: 60px;
  background: var(--bs-primary);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.section-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0);
  background-size: 20px 20px;
  pointer-events: none;
}

.stats-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
}

.cta-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%);
  pointer-events: none;
}
</style>

<template>
  <div>
    <!-- Hero Section -->
    <section class="hero-section position-relative overflow-hidden">
      <div class="hero-bg"></div>
      <div class="container position-relative py-5">
        <div class="row align-items-center min-vh-75">
          <div class="col-lg-6">
            <span class="badge bg-warning text-dark mb-3 px-3 py-2">
              <i class="bi bi-star-fill me-1"></i>{{ locale === 'fr' ? '#1 Import-Export Chine-Afrique' : '#1 China-Africa Import-Export' }} 
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
              <div class="text-white">
                <div class="fw-bold">500+</div>
                <small class="opacity-75">{{ t('home.statsClients') }}</small>
              </div>
              <div class="text-white">
                <div class="fw-bold">15+</div>
                <small class="opacity-75">{{ t('home.statsCountries') }}</small>
              </div>
              <div class="text-white">
                <div class="fw-bold">4.8/5</div>
                <small class="opacity-75"><i class="bi bi-star-fill text-warning"></i></small>
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
          <span class="badge bg-primary-subtle text-primary mb-2">{{ locale === 'fr' ? 'Ce que nous offrons' : 'What we offer' }}</span>
          <h2 class="fw-bold">{{ t('home.servicesTitle') }}</h2>
          <p class="text-muted">{{ t('home.servicesSubtitle') }}</p>
        </div>

        <div class="row g-4">
          <div v-for="service in services" :key="service.id" class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 shadow-sm hover-card">
              <div class="card-body p-4">
                <div class="service-icon mb-3">
                  <i :class="service.icon" class="fs-1 text-primary"></i>
                </div>
                <h5 class="card-title">{{ service.name }}</h5>
                <p class="card-text text-muted">{{ service.description }}</p>
                <ul class="list-unstyled mb-0">
                  <li v-for="(feature, idx) in service.features.slice(0, 3)" :key="idx" class="mb-1">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    <small>{{ feature }}</small>
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
          <span class="badge bg-success-subtle text-success mb-2">{{ locale === 'fr' ? 'Simple et rapide' : 'Simple and fast' }}</span>
          <h2 class="fw-bold">{{ locale === 'fr' ? 'Comment ca marche ?' : 'How it works?' }}</h2>
          <p class="text-muted">{{ locale === 'fr' ? 'Un processus simple et efficace en 5 etapes' : 'A simple and efficient 5-step process' }}</p>
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
          <h2 class="fw-bold">Categories de produits</h2>
          <p class="text-muted">Trouvez tout ce dont vous avez besoin</p>
        </div>

        <div class="row g-3">
          <div v-for="category in categories" :key="category.id" class="col-6 col-md-4 col-lg-3">
            <NuxtLink :to="`/personal-shopping?category=${category.id}`" class="text-decoration-none">
              <div class="card h-100 border-0 shadow-sm text-center hover-card">
                <div class="card-body py-4">
                  <i :class="category.icon" class="fs-2 mb-2" :style="{ color: category.color }"></i>
                  <h6 class="mb-0">{{ category.name }}</h6>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-5 bg-primary text-white position-relative overflow-hidden">
      <div class="stats-pattern"></div>
      <div class="container position-relative">
        <div class="row text-center">
          <div class="col-6 col-md-3 mb-4 mb-md-0">
            <div class="display-4 fw-bold">500+</div>
            <p class="mb-0 opacity-75">{{ t('home.statsClients') }}</p>
          </div>
          <div class="col-6 col-md-3 mb-4 mb-md-0">
            <div class="display-4 fw-bold">1200+</div>
            <p class="mb-0 opacity-75">{{ t('home.statsPackages') }}</p>
          </div>
          <div class="col-6 col-md-3">
            <div class="display-4 fw-bold">15+</div>
            <p class="mb-0 opacity-75">{{ t('home.statsCountries') }}</p>
          </div>
          <div class="col-6 col-md-3">
            <div class="display-4 fw-bold">5+</div>
            <p class="mb-0 opacity-75">{{ t('home.statsYears') }}</p>
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
            <h2 class="fw-bold mb-0">{{ locale === 'fr' ? 'Derniers articles' : 'Latest articles' }}</h2>
            <p class="text-muted mb-0">{{ t('blog.subtitle') }}</p>
          </div>
          <NuxtLink to="/resources/blog" class="btn btn-outline-primary">
            {{ t('common.viewAll') }} <i class="bi bi-arrow-right ms-1"></i>
          </NuxtLink>
        </div>

        <div class="row g-4">
          <div v-for="post in recentPosts" :key="post.id" class="col-md-6 col-lg-3">
            <div class="card h-100 border-0 shadow-sm">
              <img :src="post.image" class="card-img-top" :alt="post.title" style="height: 160px; object-fit: cover;" />
              <div class="card-body">
                <span class="badge bg-primary-subtle text-primary mb-2">{{ post.category }}</span>
                <h6 class="card-title">{{ post.title }}</h6>
                <p class="card-text small text-muted">{{ truncate(post.excerpt, 80) }}</p>
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
    <section class="py-5 bg-dark text-white position-relative overflow-hidden">
      <div class="cta-pattern"></div>
      <div class="container text-center position-relative">
        <h2 class="fw-bold mb-3">{{ locale === 'fr' ? 'Pret a commencer ?' : 'Ready to get started?' }}</h2>
        <p class="lead opacity-75 mb-4">
          {{ locale === 'fr' ? 'Soumettez votre premiere demande ou contactez-nous pour en savoir plus' : 'Submit your first request or contact us to learn more' }}
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
import { FAKE_SERVICES, FAKE_CATEGORIES } from '~/utils/data/fakeData'
import { useBlogStore } from '~/stores/blog'
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({
  layout: 'default'
})

const { t, locale } = useI18n()
const blogStore = useBlogStore()
const { truncate } = useFormatters()

// Data
const services = FAKE_SERVICES
const categories = FAKE_CATEGORIES

const steps = computed(() => locale.value === 'fr' ? [
  { title: 'Envoyez les images', description: 'Photos du produit souhaite' },
  { title: 'Discutons', description: 'Echange via WhatsApp' },
  { title: 'Devis', description: 'Recevez votre devis' },
  { title: 'Paiement', description: 'Confirmez et payez' },
  { title: 'Livraison', description: 'Recevez votre colis' }
] : [
  { title: 'Send images', description: 'Photos of desired product' },
  { title: 'Let\'s talk', description: 'Chat via WhatsApp' },
  { title: 'Quote', description: 'Receive your quote' },
  { title: 'Payment', description: 'Confirm and pay' },
  { title: 'Delivery', description: 'Receive your package' }
])

// Load blog posts
await blogStore.fetchPosts()
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

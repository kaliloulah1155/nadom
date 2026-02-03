<template>
  <div class="ps-page">
    <!-- Hero Section -->
    <section class="ps-hero">
      <div class="container position-relative">
        <div class="row align-items-center">
          <div class="col-lg-8 text-white">
            <div class="mb-3">
              <span class="badge bg-warning text-white px-3">
                <i class="bi bi-bag-heart me-1"></i>{{ t('personalShopping.badge') }}
              </span>
            </div>
            <h1 class="display-5 fw-bold mb-3 text-white">{{ t('personalShopping.title') }}</h1>
            <p class="lead opacity-75 mb-0 text-white">{{ t('personalShopping.subtitle') }}</p>
          </div>
          <div class="col-lg-4 text-lg-end mt-4 mt-lg-0">
            <NuxtLink to="/personal-shopping/new" class="btn btn-light btn-md">
              <i class="bi bi-plus-circle me-2"></i>{{ t('personalShopping.newRequest') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <div class="container mt-1">
      <!-- How It Works -->
      <section class="how-it-works-section mb-5">
        <div class="text-center mb-5">
          <span class="badge bg-success-subtle text-success mb-2">{{ t('personalShopping.howItWorks') }}</span>
          <h2 class="fw-bold">{{ t('personalShopping.processTitle') }}</h2>
          <p class="text-muted">{{ t('personalShopping.processSubtitle') }}</p>
        </div>

        <div class="row g-4">
          <div v-for="(step, index) in steps" :key="index" class="col-6 col-lg">
            <div class="card h-100 border-0 shadow-sm text-center step-card">
              <div class="card-body p-4">
                <div class="step-number mx-auto mb-3">{{ index + 1 }}</div>
                <h5>{{ step.title }}</h5>
                <p class="text-muted mb-0 small">{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Categories -->
      <section class="categories-section mb-5">
        <div class="text-center mb-5">
          <span class="badge bg-primary-subtle text-primary mb-2">{{ t('personalShopping.categories') }}</span>
          <h2 class="fw-bold">{{ t('personalShopping.categoriesTitle') }}</h2>
          <p class="text-muted">{{ t('personalShopping.categoriesSubtitle') }}</p>
        </div>

        <div class="row g-3">
          <div v-for="category in categories" :key="category.id" class="col-6 col-md-4 col-lg-3">
            <div
              class="card h-100 border-0 shadow-sm text-center category-card"
              :class="{ 'selected': selectedCategory === category.id }"
              @click="selectedCategory = selectedCategory === category.id ? null : category.id"
            >
              <div class="card-body py-4">
                <div class="category-icon mx-auto mb-3" :style="{ background: category.color + '20', color: category.color }">
                  <i :class="category.icon"></i>
                </div>
                <h6 class="mb-0">{{ (category as any)[`name_${locale}`] || (category as any).name_fr }}</h6>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Pricing Section -->
      <section class="pricing-section mb-5">
        <div class="text-center mb-5">
          <span class="badge bg-info-subtle text-info mb-2">{{ t('pricing.title') }}</span>
          <h2 class="fw-bold">{{ t('personalShopping.pricingTitle') }}</h2>
          <p class="text-muted">{{ t('personalShopping.pricingSubtitle') }}</p>
        </div>

        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="card border-0 shadow-lg pricing-card">
              <div class="card-body p-4">
                <div class="pricing-item">
                  <div class="d-flex align-items-center">
                    <div class="pricing-icon me-3">
                      <i class="bi bi-search"></i>
                    </div>
                    <div>
                      <h6 class="mb-0">{{ t('personalShopping.pricing.search') }}</h6>
                      <small class="text-muted">{{ t('personalShopping.pricing.searchDesc') }}</small>
                    </div>
                  </div>
                  <span class="badge bg-success fs-6">{{ t('personalShopping.pricing.free') }}</span>
                </div>

                <div class="pricing-item">
                  <div class="d-flex align-items-center">
                    <div class="pricing-icon me-3">
                      <i class="bi bi-percent"></i>
                    </div>
                    <div>
                      <h6 class="mb-0">{{ t('personalShopping.pricing.commission') }}</h6>
                      <small class="text-muted">{{ t('personalShopping.pricing.commissionDesc') }}</small>
                    </div>
                  </div>
                  <span class="fw-bold text-primary">5%</span>
                </div>

                <div class="pricing-item">
                  <div class="d-flex align-items-center">
                    <div class="pricing-icon me-3">
                      <i class="bi bi-eye"></i>
                    </div>
                    <div>
                      <h6 class="mb-0">{{ t('personalShopping.pricing.inspection') }}</h6>
                      <small class="text-muted">{{ t('personalShopping.pricing.inspectionDesc') }}</small>
                    </div>
                  </div>
                  <span class="fw-bold">5K - 15K FCFA</span>
                </div>
                <div class="pricing-item">
                  <div class="d-flex align-items-center">
                    <div class="pricing-icon me-3">
                      <i class="bi bi-box-seam"></i>
                    </div>
                    <div>
                      <h6 class="mb-0">{{ t('personalShopping.pricing.packaging') }}</h6>
                      <small class="text-muted">{{ t('personalShopping.pricing.packagingDesc') }}</small>
                    </div>
                  </div>
                  <span class="fw-bold">3K - 10K FCFA</span>
                </div>

                <div class="pricing-item border-0">
                  <div class="d-flex align-items-center">
                    <div class="pricing-icon me-3">
                      <i class="bi bi-truck"></i>
                    </div>
                    <div>
                      <h6 class="mb-0">{{ t('personalShopping.pricing.shipping') }}</h6>
                      <small class="text-muted">{{ t('personalShopping.pricing.shippingDesc') }}</small>
                    </div>
                  </div>
                  <NuxtLink to="/import-export/calculator" class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-calculator me-1"></i>{{ t('personalShopping.pricing.calculate') }}
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Advantages -->
      <section class="advantages-section mb-5">
        <div class="text-center mb-5">
          <h2 class="fw-bold">{{ t('personalShopping.whyUs') }}</h2>
        </div>

        <div class="row g-4">
          <div v-for="(adv, index) in advantages" :key="index" class="col-md-6 col-lg-3">
            <div class="text-center advantage-item">
              <div class="advantage-icon mx-auto mb-3">
                <i :class="adv.icon"></i>
              </div>
              <h5>{{ adv.title }}</h5>
              <p class="text-muted small mb-0">{{ adv.description }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- CTA Section -->
    <section class="cta-section py-5">
      <div class="cta-pattern"></div>
      <div class="container text-center position-relative">
        <h2 class="fw-bold text-white mb-3">{{ t('personalShopping.ctaTitle') }}</h2>
        <p class="lead text-white opacity-75 mb-4">{{ t('personalShopping.ctaSubtitle') }}</p>
        <div class="d-flex justify-content-center gap-3 flex-wrap">
          <NuxtLink to="/personal-shopping/new" class="btn btn-light btn-lg">
            <i class="bi bi-bag-plus me-2"></i>{{ t('personalShopping.newRequest') }}
          </NuxtLink>
          <a :href="`https://wa.me/${useRuntimeConfig().public.whatsapp}`" target="_blank" class="btn btn-outline-light btn-lg">
            <i class="bi bi-whatsapp me-2"></i>{{ t('common.contactUs') }}
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { FAKE_CATEGORIES } from '~/utils/data/fakeData'

definePageMeta({
  layout: 'default'
})

const { t, locale } = useI18n()

const categories = FAKE_CATEGORIES
const selectedCategory = ref<string | null>(null)

const steps = computed(() => locale.value === 'fr' ? [
  { title: 'Envoyez les images', description: 'Partagez des photos ou liens du produit que vous recherchez' },
  { title: 'Discussion WhatsApp', description: 'Echangez avec notre agent pour preciser vos besoins' },
  { title: 'Devis detaille', description: 'Recevez un devis complet avec tous les frais' },
  { title: 'Paiement securise', description: 'Validez et payez via nos moyens de paiement' },
  { title: 'Livraison', description: 'Recevez votre colis chez vous' }
] : [
  { title: 'Send images', description: 'Share photos or links of the product you are looking for' },
  { title: 'WhatsApp chat', description: 'Chat with our agent to clarify your needs' },
  { title: 'Detailed quote', description: 'Receive a complete quote with all fees' },
  { title: 'Secure payment', description: 'Validate and pay via our payment methods' },
  { title: 'Delivery', description: 'Receive your package at home' }
])

const advantages = computed(() => locale.value === 'fr' ? [
  { icon: 'bi bi-shield-check', title: 'Securite', description: 'Verification qualite avant expedition' },
  { icon: 'bi bi-cash-stack', title: 'Prix competitifs', description: 'Negociation directe avec les fournisseurs' },
  { icon: 'bi bi-chat-dots', title: 'Support 24/7', description: 'Assistance via WhatsApp' },
  { icon: 'bi bi-geo-alt', title: 'Suivi en temps reel', description: 'Tracking de votre colis' }
] : [
  { icon: 'bi bi-shield-check', title: 'Security', description: 'Quality check before shipping' },
  { icon: 'bi bi-cash-stack', title: 'Competitive prices', description: 'Direct negotiation with suppliers' },
  { icon: 'bi bi-chat-dots', title: '24/7 Support', description: 'Assistance via WhatsApp' },
  { icon: 'bi bi-geo-alt', title: 'Real-time tracking', description: 'Tracking of your package' }
])
</script>

<style scoped>
.ps-page {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.ps-hero {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  padding-bottom: 100px;
  position: relative;
  overflow: hidden;
}

.hero-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
}

.how-it-works-section,
.categories-section,
.pricing-section,
.advantages-section {
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.step-card {
  transition: transform 0.3s ease;
  border-radius: 16px;
}

.step-card:hover {
  transform: translateY(-5px);
}

.step-number {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--bs-primary) 0%, #0056b3 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: bold;
}

.category-card {
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 16px;
}

.category-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.category-card.selected {
  border: 2px solid var(--bs-primary) !important;
  background: rgba(var(--bs-primary-rgb), 0.05);
}

.category-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.pricing-card {
  border-radius: 16px;
}

.pricing-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #e5e7eb;
}

.pricing-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(var(--bs-primary-rgb), 0.1) 0%, rgba(var(--bs-primary-rgb), 0.2) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bs-primary);
}

.advantage-item {
  padding: 20px;
}

.advantage-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, var(--bs-primary) 0%, #0056b3 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.cta-section {
  background: linear-gradient(135deg, var(--bs-primary) 0%, #0056b3 100%);
  position: relative;
  overflow: hidden;
}

.cta-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
  pointer-events: none;
}
</style>

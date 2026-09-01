<template>
  <div>
    <!-- Hero -->
    <section class="hero-mini py-5 bg-primary text-white">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <h1 class="display-5 fw-bold mb-3 text-white">{{ t('pricing.title') }}</h1>
            <p class="lead opacity-75 mb-0 text-white">
              {{ t('pricing.subtitle') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Cards -->
    <section class="py-5">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="fw-bold">{{ t('pricing.chooseFormula') }}</h2>
          <p class="text-muted">{{ t('pricing.adaptedRates') }}</p>
        </div>

        <div class="row g-4 justify-content-center">
          <!-- Personal Shopping -->
          <div class="col-lg-4 col-md-6">
            <div class="card h-100 border-0 shadow-sm pricing-card">
              <div class="card-header bg-transparent text-center py-4">
                <div class="pricing-icon mb-3">
                  <i class="bi bi-bag-check fs-1 text-primary"></i>
                </div>
                <h4 class="mb-0">{{ t('pricing.personalShopping') }}</h4>
                <p class="text-muted small mb-0">{{ t('pricing.searchPurchase') }}</p>
              </div>
              <div class="card-body p-4">
                <div class="price-tag text-center mb-4">
                  <span class="h2 fw-bold text-primary">5%</span>
                  <span class="text-muted">{{ t('pricing.commission') }}</span>
                </div>
                <ul class="list-unstyled">
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    {{ t('pricing.productSearch') }}
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    {{ t('pricing.priceNegotiation') }}
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    {{ t('pricing.qualityControl') }}
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    {{ t('pricing.photosBeforeShipping') }}
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    {{ t('pricing.whatsappTracking') }}
                  </li>
                </ul>
              </div>
              <div class="card-footer bg-transparent border-0 p-4">
                <NuxtLink to="/personal-shopping/new" class="btn btn-primary w-100">
                  {{ t('common.getStarted') }}
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Expedition -->
          <div class="col-lg-4 col-md-6">
            <div class="card h-100 border-primary border-2 shadow pricing-card featured">
              <div
                class="badge bg-primary text-white rounded-pill px-3 py-2 position-absolute start-50 translate-middle-x text-uppercase fw-semibold"
                style="top: 12px; font-size: 0.78rem; letter-spacing: .5px; z-index: 3; box-shadow: 0 2px 8px rgba(0,0,0,.15);"
              >
                {{ t('pricing.popular') }}
              </div>
              <div class="card-header bg-transparent text-center py-4">
                <div class="pricing-icon mb-3">
                  <i class="bi bi-airplane fs-1 text-primary"></i>
                </div>
                <h4 class="mb-0">{{ t('pricing.shipping') }}</h4>
                <p class="text-muted small mb-0">{{ t('pricing.goodsTransport') }}</p>
              </div>
              <div class="card-body p-4">
                <div class="price-tag text-center mb-4">
                  <span class="text-muted">{{ t('pricing.from') }}</span>
                  <span class="h2 fw-bold text-primary d-block">9 000 FCFA</span>
                  <span class="text-muted">/kg (aerien)</span>
                </div>
                <ul class="list-unstyled">
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    {{ t('pricing.airExpress') }}
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    {{ t('pricing.airStandard') }}
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    {{ t('pricing.seaFreight') }}
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    {{ t('pricing.securePacking') }}
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    {{ t('pricing.realTimeTracking') }}
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    {{ t('pricing.insuranceIncluded') }}
                  </li>
                </ul>
              </div>
              <div class="card-footer bg-transparent border-0 p-4">
                <NuxtLink to="/import-export/calculator" class="btn btn-primary w-100">
                  {{ t('pricing.calculateRate') }}
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Services Annexes -->
          <div class="col-lg-4 col-md-6">
            <div class="card h-100 border-0 shadow-sm pricing-card">
              <div class="card-header bg-transparent text-center py-4">
                <div class="pricing-icon mb-3">
                  <i class="bi bi-gear fs-1 text-primary"></i>
                </div>
                <h4 class="mb-0">{{ t('pricing.additionalServices') }}</h4>
                <p class="text-muted small mb-0">{{ t('pricing.visaGuides') }}</p>
              </div>
              <div class="card-body p-4">
                <div class="price-tag text-center mb-4">
                  <span class="text-muted">{{ t('pricing.variableAccording') }}</span>
                  <span class="h4 fw-bold text-primary d-block">{{ t('pricing.service') }}</span>
                </div>
                <ul class="list-unstyled">
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    {{ t('pricing.chinaVisaAssistance') }}
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    {{ t('pricing.frenchGuides') }}
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    {{ t('pricing.factoryVisits') }}
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    {{ t('pricing.interpretation') }}
                  </li>
                  <li class="mb-3">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    {{ t('pricing.marketAccompaniment') }}
                  </li>
                </ul>
              </div>
              <div class="card-footer bg-transparent border-0 p-4">
                <a :href="`https://wa.me/${useRuntimeConfig().public.whatsapp}`" target="_blank" class="btn btn-outline-primary w-100">
                  <i class="bi bi-whatsapp me-2"></i>{{ t('common.contactUs') }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Shipping Rates Table -->
    <section class="py-5 bg-light">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="fw-bold">{{ t('pricing.shippingRatesTable') }}</h2>
          <p class="text-muted">{{ t('pricing.ratesPerKg') }}</p>
        </div>

        <div class="table-responsive">
          <table class="table table-hover bg-white rounded shadow-sm">
            <thead class="table-primary">
              <tr>
                <th>{{ t('pricing.destination') }}</th>
                <th class="text-center">{{ t('pricing.airExpressTitle') }}<br><small>{{ t('pricing.airExpressDays') }}</small></th>
                <th class="text-center">{{ t('pricing.airStandardTitle') }}<br><small>{{ t('pricing.airStandardDays') }}</small></th>
                <th class="text-center">{{ t('pricing.seaTitle') }}<br><small>{{ t('pricing.seaDays') }}</small></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="destinations.length === 0">
                <td colspan="4" class="text-center text-muted py-4">
                  {{ t('pricing.noDestinations') }}
                </td>
              </tr>
              <tr v-for="dest in destinations" :key="dest.id">
                <td>
                  <span class="d-inline-flex align-items-center gap-2">
                    <CountryFlag
                      :iso="countriesStore.iso3166FromCountryField(dest.country)"
                      :emoji="dest.flag"
                      :label="dest.country"
                      size="1.35rem"
                    />
                    <span>{{ dest.country }}</span>
                  </span>
                </td>
                <td class="text-center">
                  <strong v-if="getCost(dest, 'air_express')">{{ formatCurrency(getCost(dest, 'air_express'), destCurrency(dest)) }}</strong>
                  <span v-else class="text-muted">-</span>/kg
                </td>
                <td class="text-center">
                  <strong v-if="getCost(dest, 'air_normal')">{{ formatCurrency(getCost(dest, 'air_normal'), destCurrency(dest)) }}</strong>
                  <span v-else class="text-muted">-</span>/kg
                </td>
                <td class="text-center">
                  <strong v-if="getCost(dest, 'sea')">{{ formatCurrency(getCost(dest, 'sea'), destCurrency(dest)) }}</strong>
                  <span v-else class="text-muted">-</span>/m³
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="alert alert-info mt-4">
          <i class="bi bi-info-circle me-2"></i>
          {{ t('pricing.indicativeRates') }}
          <NuxtLink to="/import-export/calculator" class="alert-link">{{ t('pricing.useCalculator') }}</NuxtLink> {{ t('pricing.preciseEstimate') }}
        </div>
      </div>
    </section>

    <!-- FAQ Pricing -->
    <section class="py-5">
      <div class="container">
        <div class="row">
          <div class="col-lg-6">
            <h3 class="fw-bold mb-4">{{ t('pricing.faq') }}</h3>
            <div v-if="pricingFaqs.length" class="accordion" id="pricingFaq">
              <div
                v-for="(faq, idx) in pricingFaqs"
                :key="faq.id"
                class="accordion-item border-0 mb-3 shadow-sm"
              >
                <h2 class="accordion-header">
                  <button
                    class="accordion-button"
                    :class="{ collapsed: idx !== 0 }"
                    type="button"
                    data-bs-toggle="collapse"
                    :data-bs-target="`#pricingFaq${idx}`"
                  >
                    {{ faq[`question_${locale}`] || faq.question_fr }}
                  </button>
                </h2>
                <div
                  :id="`pricingFaq${idx}`"
                  class="accordion-collapse collapse"
                  :class="{ show: idx === 0 }"
                  data-bs-parent="#pricingFaq"
                >
                  <div class="accordion-body" v-html="sanitizeHtml(faq[`answer_${locale}`] || faq.answer_fr)"></div>
                </div>
              </div>
            </div>
            <p v-else class="text-muted">{{ t('faq.noQuestions') }}</p>
          </div>
          <div class="col-lg-6">
            <div class="card border-0 shadow-sm bg-primary text-white h-100">
              <div class="card-body p-5 d-flex flex-column justify-content-center">
                <h3 class="fw-bold mb-3">{{ t('pricing.needQuote') }}</h3>
                <p class="opacity-75 mb-4">
                  {{ t('pricing.needQuoteDesc') }}
                </p>
                <div class="d-flex gap-3 flex-wrap">
                  <a :href="`https://wa.me/${useRuntimeConfig().public.whatsapp}`" target="_blank" class="btn btn-light">
                    <i class="bi bi-whatsapp me-2"></i>WhatsApp
                  </a>
                  <NuxtLink to="/contact-us" class="btn btn-outline-light">
                    {{ t('pricing.contactForm') }}
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCountriesStore } from '~/stores/countries'
import { useShippingStore } from '~/stores/shipping'
import { useBlogStore } from '~/stores/blog'
import type { FAQ } from '~/stores/blog'
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({
  layout: 'default'
})

const { t, locale } = useI18n()

useSeoMeta({
  title: () => t('seo.pricing.title'),
  description: () => t('seo.pricing.description'),
  ogTitle: () => t('seo.pricing.title'),
  ogDescription: () => t('seo.pricing.description'),
})
const { formatCurrency } = useFormatters()
const shippingStore = useShippingStore()
const countriesStore = useCountriesStore()
const blogStore = useBlogStore()

const destinations = computed(() => shippingStore.destinations)

// FAQ affichées sur cette page = statut 2, ordonnées par position (côté API).
const pricingFaqs = ref<FAQ[]>([])

const getCost = (dest: any, mode: string): number => {
  const modes = dest.shipping_modes || dest.shippingModes || []
  const found = modes.find((m: any) => m.mode === mode)
  if (!found) return 0
  const v = found.cost_per_kg ?? found.costPerKg
  return Number(v) || 0
}

/** Devise propre à la destination — alignée sur la logique du calculateur. */
const destCurrency = (dest: any): string => {
  const raw = dest?.currency_code
  return raw && String(raw).trim() ? String(raw).toUpperCase() : 'XOF'
}

const [, , faqs] = await Promise.all([
  shippingStore.fetchDestinations(),
  countriesStore.fetchAll(),
  blogStore.fetchFAQByStatut(2),
])
pricingFaqs.value = faqs
</script>

<style scoped>
.hero-mini {
  background: linear-gradient(135deg, var(--bs-primary) 0%, #1e40af 100%);
}

.pricing-card {
  transition: transform 0.3s ease;
}

.pricing-card:hover {
  transform: translateY(-10px);
}

.pricing-card.featured {
  transform: scale(1.02);
}

.pricing-card.featured:hover {
  transform: scale(1.02) translateY(-10px);
}

.pricing-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(var(--bs-primary-rgb), 0.1) 0%, rgba(var(--bs-primary-rgb), 0.2) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.accordion-button:not(.collapsed) {
  background-color: var(--bs-primary-bg-subtle);
  color: var(--bs-primary);
}
</style>

<template>
  <div>
    <!-- Hero -->
    <section class="hero-mini py-5 bg-primary text-white">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <h1 class="display-5 fw-bold mb-3 text-white">{{ t('importExport.title') }}</h1>
            <p class="lead opacity-75 mb-0 text-white">
              {{ t('importExport.subtitle') }}
            </p>
          </div>
          <div class="col-lg-4 text-lg-end mt-4 mt-lg-0">
            <NuxtLink to="/import-export/calculator" class="btn btn-light btn-md me-2">
              <i class="bi bi-calculator "></i>{{ t('nav.calculator') }}
            </NuxtLink>
            <NuxtLink to="/import-export/tracking" class="btn btn-outline-light btn-md">
              <i class="bi bi-search"></i>{{ t('nav.tracking') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Shipping Modes -->
    <section class="py-5">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="fw-bold">{{ t('importExport.shippingModes') }}</h2>
          <p class="text-muted">{{ t('importExport.shippingModesSubtitle') }}</p>
        </div>

        <div v-if="loadingModes && shippingModes.length === 0" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
          <p class="text-muted mt-3 mb-0">Chargement des modes...</p>
        </div>

        <div v-else-if="shippingModes.length === 0" class="text-center py-5 text-muted">
          <i class="bi bi-inbox fs-1 d-block mb-2"></i>
          Aucun mode d'expedition configuré.
        </div>

        <div v-else class="row g-4">
          <div
            v-for="(mode, idx) in shippingModes"
            :key="mode.uuid"
            class="col-md-4"
          >
            <div class="card h-100 border-0 shadow-sm" :class="{ 'border-primary': isFeatured(idx) }">
              <div v-if="isFeatured(idx)" class="card-header bg-primary text-white text-center py-2">
                <small class="fw-medium">{{ t('pricing.popular') }}</small>
              </div>
              <div class="card-body p-4 text-center">
                <div
                  class="shipping-icon mx-auto mb-3"
                  :class="iconBgClass(mode.code ?? '')"
                >
                  <i :class="mode.icon || defaultIcon(mode.code ?? '')"></i>
                </div>
                <h5>{{ mode.label }}</h5>
                <div
                  v-if="mode.description"
                  class="shipping-mode-desc text-muted text-start"
                  v-html="mode.description"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Destinations -->
    <section class="py-5 bg-light">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="fw-bold">{{ t('importExport.destinations') }}</h2>
          <p class="text-muted">{{ t('importExport.destinationsSubtitle') }}</p>
        </div>

        <div v-if="countriesStore.loading && destinationCountries.length === 0" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
        </div>

        <div v-else-if="destinationCountries.length === 0" class="text-center py-4 text-muted">
          <i class="bi bi-globe fs-1 d-block mb-2"></i>
          Aucun pays configuré.
        </div>

        <div v-else class="row g-3">
          <div
            v-for="country in destinationCountries"
            :key="country.uuid"
            class="col-6 col-md-4 col-lg-3"
          >
            <div class="card h-100 border-0 shadow-sm text-center">
              <div class="card-body py-3">
                <span class="fs-2">{{ country.flag_emoji || '🌍' }}</span>
                <h6 class="mb-0 mt-2">{{ countryName(country) }}</h6>
                <small class="text-muted">
                  {{ country.code }} · {{ country.currency || '—' }}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services -->
    <section class="py-5">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-6 col-lg-3">
            <div class="text-center">
              <div class="service-icon mx-auto mb-3">
                <i class="bi bi-box-seam"></i>
              </div>
              <h5>{{ t('importExport.consolidation') }}</h5>
              <p class="text-muted small">{{ t('importExport.consolidationDesc') }}</p>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="text-center">
              <div class="service-icon mx-auto mb-3">
                <i class="bi bi-shield-check"></i>
              </div>
              <h5>{{ t('importExport.securePacking') }}</h5>
              <p class="text-muted small">{{ t('importExport.securePackingDesc') }}</p>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="text-center">
              <div class="service-icon mx-auto mb-3">
                <i class="bi bi-file-text"></i>
              </div>
              <h5>{{ t('importExport.customsClearance') }}</h5>
              <p class="text-muted small">{{ t('importExport.customsClearanceDesc') }}</p>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="text-center">
              <div class="service-icon mx-auto mb-3">
                <i class="bi bi-truck"></i>
              </div>
              <h5>{{ t('importExport.delivery') }}</h5>
              <p class="text-muted small">{{ t('importExport.deliveryDesc') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-5 bg-primary text-white text-center">
      <div class="container">
        <h2 class="fw-bold mb-3">{{ t('importExport.ctaTitle') }}</h2>
        <p class="lead opacity-75 mb-4">{{ t('importExport.ctaSubtitle') }}</p>
        <NuxtLink to="/import-export/calculator" class="btn btn-light btn-lg">
          <i class="bi bi-calculator me-2"></i>{{ t('importExport.useCalculator') }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useShippingStore } from '~/stores/shipping'
import { usePersonalShoppingStore } from '~/stores/personalShopping'
import { useCountriesStore } from '~/stores/countries'

definePageMeta({
  layout: 'default'
})

const { t, locale } = useI18n()
const shippingStore = useShippingStore()
const psStore = usePersonalShoppingStore()
const countriesStore = useCountriesStore()
const loadingModes = ref(true)

onMounted(async () => {
  try {
    await Promise.all([
      shippingStore.fetchDestinations(),
      psStore.fetchCategories(),
      countriesStore.fetchAll(),
    ])
  } finally {
    loadingModes.value = false
  }
})

const destinationCountries = computed(() => countriesStore.activeCountries)
const countryName = (c: any) => (locale.value === 'en' ? c.name_en : c.name_fr) || c.label || c.code

const shippingModes = computed(() => {
  return (psStore.categories || [])
    .filter((c: any) => (c.slug || '').toUpperCase() === 'MEX' && (c.status === '1' || c.status === 1))
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
})

const isFeatured = (idx: number) => idx === 1 // 2e mode = mis en avant
const defaultIcon = (code: string) => {
  if (code === 'sea') return 'bi bi-water'
  if (code === 'air_express' || code === 'air_normal') return 'bi bi-airplane'
  return 'bi bi-truck'
}
const iconBgClass = (code: string) => {
  if (code === 'air_express') return 'bg-danger-subtle text-danger'
  if (code === 'air_normal') return 'bg-primary-subtle text-primary'
  if (code === 'sea') return 'bg-info-subtle text-info'
  return 'bg-secondary-subtle text-secondary'
}
</script>

<style scoped>
.hero-mini {
  background: linear-gradient(135deg, var(--bs-primary) 0%, #1e40af 100%);
}

.shipping-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.service-icon {
  width: 70px;
  height: 70px;
  background: var(--bs-primary);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.shipping-mode-desc :deep(p) { margin-bottom: 0.6rem; }
.shipping-mode-desc :deep(ul) { padding-left: 1.1rem; margin-bottom: 0; }
.shipping-mode-desc :deep(li) { margin-bottom: 0.25rem; }
</style>

<template>
  <div>
        <!-- Hero -->
    <section class="hero-mini py-5 bg-primary text-white">
      <div class="container">
        <div class="row">
            <h1 class="display-5 fw-bold mb-3 text-white text-center">{{ t('calculator.title') }}</h1>
            <p class="lead opacity-75 mb-0 text-white text-center">
              {{ t('calculator.subtitle') }}
            </p>
        </div>
      </div>
    </section>
    <div class="container mt-3 mb-2">
      <div class="row justify-content-center">
        <div class="col-lg-8">

          <!-- Calculator Card -->
          <div class="card border-0 shadow">
            <div class="card-body p-4 p-lg-5">
              <form @submit.prevent="calculateCost">
                <!-- Destination -->
                <div class="mb-4">
                  <label class="form-label fw-medium">{{ t('calculator.destinationCountry') }}</label>
                  <select
                    v-model="form.destination"
                    class="form-select form-select-lg"
                    required
                    @change="onDestinationChange"
                  >
                    <option value="">{{ t('calculator.selectCountry') }}</option>
                    <option v-for="dest in destinationOptions" :key="dest.id" :value="dest.country">
                      <template v-if="dest.flag">{{ dest.flag }} </template>{{ dest.country }}<template v-if="dest.city"> - {{ dest.city }}</template>
                    </option>
                  </select>
                </div>

                <!-- Shipping Mode -->
                <div class="mb-4">
                  <label class="form-label fw-medium">{{ t('calculator.shippingMode') }}</label>
                  <div class="row g-3">
                    <div v-for="mode in availableModes" :key="mode.mode" class="col-md-4">
                      <div
                        class="card h-100 cursor-pointer"
                        :class="{
                          'border-primary bg-primary-subtle': form.shippingMode === mode.mode,
                          'border': form.shippingMode !== mode.mode
                        }"
                        @click="form.shippingMode = (mode.mode || (mode as any).code) as ShippingMode"
                      >
                        <div class="card-body text-center py-3">
                          <i
                            :class="[(mode as any).icon || getModeIcon(mode.mode), 'fs-3 mb-2', { 'text-primary': form.shippingMode === mode.mode }]"
                          ></i>
                          <h6 class="mb-1">{{ (mode as any).label || getModeLabel(mode.mode) }}</h6>
                          <small v-if="mode.duration" class="text-muted d-block">{{ mode.duration }}</small>
                          <strong v-if="mode.costPerKg > 0" class="text-primary">{{ formatCurrency(mode.costPerKg) }}/kg</strong>
                          <small v-else class="text-muted d-block">{{ t('calculator.selectCountry') }}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Weight -->
                <div class="mb-4">
                  <label class="form-label fw-medium">{{ t('calculator.totalWeight') }}</label>
                  <input
                    v-model.number="form.weight"
                    type="number"
                    class="form-control form-control-lg"
                    placeholder="Ex: 10"
                    min="0.1"
                    step="0.1"
                    required
                  />
                  <small class="text-muted">{{ t('calculator.weightHint') }}</small>
                </div>

                <!-- Calculate Button -->
                <button
                  type="submit"
                  class="btn btn-primary btn-lg w-100"
                  :disabled="!canCalculate"
                >
                  <i class="bi bi-calculator me-2"></i>{{ t('calculator.calculate') }}
                </button>
              </form>

              <!-- Result -->
              <div v-if="result" class="mt-5 pt-4 border-top">
                <h5 class="fw-bold mb-4">{{ t('calculator.costEstimate') }}</h5>

                <div class="card bg-light border-0 mb-4">
                  <div class="card-body">
                    <div class="row text-center">
                      <div class="col-4">
                        <small class="text-muted d-block">{{ t('calculator.destination') }}</small>
                        <strong>{{ form.destination }}</strong>
                      </div>
                      <div class="col-4">
                        <small class="text-muted d-block">{{ t('calculator.mode') }}</small>
                        <strong>{{ getModeLabel(form.shippingMode!) }}</strong>
                      </div>
                      <div class="col-4">
                        <small class="text-muted d-block">{{ t('calculator.weight') }}</small>
                        <strong>{{ form.weight }} kg</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <table class="table table-borderless">
                  <tbody>
                    <tr>
                      <td>{{ t('calculator.shippingCost') }}</td>
                      <td class="text-end">{{ formatCurrency(result.shippingCost) }}</td>
                    </tr>
                    <tr>
                      <td>{{ t('calculator.insurance') }}</td>
                      <td class="text-end">{{ formatCurrency(result.insurance) }}</td>
                    </tr>
                    <tr>
                      <td>{{ t('calculator.handling') }}</td>
                      <td class="text-end">{{ formatCurrency(result.handling) }}</td>
                    </tr>
                    <tr class="border-top fw-bold fs-5">
                      <td>{{ t('calculator.totalEstimate') }}</td>
                      <td class="text-end text-primary">{{ formatCurrency(result.total) }}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="alert alert-info">
                  <i class="bi bi-info-circle me-2"></i>
                  <small>{{ t('calculator.customsNote') }}</small>
                </div>

                <div class="d-grid gap-2">
                  <a :href="`https://wa.me/${useRuntimeConfig().public.whatsapp}`" target="_blank" class="btn btn-success">
                    <i class="bi bi-whatsapp me-2"></i>{{ t('calculator.getPreciseQuote') }}
                  </a>
                  <NuxtLink to="/personal-shopping/new" class="btn btn-outline-primary">
                    {{ t('calculator.orderViaShopping') }}
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useShippingStore, type ShippingMode } from '~/stores/shipping'
import { useCountriesStore } from '~/stores/countries'
import { usePersonalShoppingStore } from '~/stores/personalShopping'
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({
  layout: 'default'
})

const { t, locale } = useI18n()
const shippingStore = useShippingStore()
const countriesStore = useCountriesStore()
const psStore = usePersonalShoppingStore()
const { formatCurrency } = useFormatters()

const form = reactive({
  destination: '',
  shippingMode: null as ShippingMode | null,
  weight: null as number | null
})

const result = ref<{
  shippingCost: number
  insurance: number
  handling: number
  total: number
} | null>(null)

// Load destinations + countries + shipping modes (MEX categories)
onMounted(async () => {
  await Promise.all([
    shippingStore.fetchDestinations(),
    countriesStore.fetchAll(),
    psStore.fetchCategories(),
  ])
})

const destinations = computed(() => shippingStore.destinations)

// Merge: prefer shipping destinations (have pricing) and fall back to all countries
const destinationOptions = computed(() => {
  const fromShipping = (shippingStore.destinations || []).map((d: any) => ({
    id: `s-${d.id}`,
    country: d.country,
    city: d.city,
    flag: d.flag
  }))
  const shippingCountries = new Set(fromShipping.map(d => d.country))
  const fromCountries = (countriesStore.activeCountries || [])
    .filter(c => !shippingCountries.has(c.label))
    .map(c => ({ id: `c-${c.uuid}`, country: c.label, city: '', flag: '' }))
  return [...fromShipping, ...fromCountries]
})

// Modes MEX depuis les catégories (toujours disponibles)
const mexModes = computed(() =>
  (psStore.categories || [])
    .filter((c: any) => (c.slug || '').toUpperCase() === 'MEX' && (c.status === '1' || c.status === 1))
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
)

const availableModes = computed(() => {
  // Si une destination est sélectionnée et a des modes avec tarif, on les utilise
  const destModes = form.destination ? shippingStore.getShippingModes(form.destination) : []
  if (destModes.length > 0) return destModes
  // Sinon, afficher les modes MEX globaux (sans tarif)
  return mexModes.value.map((c: any) => ({
    mode: (c.code || c.slug || '') as ShippingMode,
    duration: c.description ? '' : '',
    costPerKg: 0,
    label: c.label,
    icon: c.icon,
  }))
})

const canCalculate = computed(() => {
  return form.destination && form.shippingMode && form.weight && form.weight > 0
})

const onDestinationChange = () => {
  form.shippingMode = null
  result.value = null
}

const getModeIcon = (mode: string) => {
  // Chercher d'abord dans les catégories MEX
  const cat = mexModes.value.find((c: any) => c.code === mode || c.slug === mode)
  if (cat?.icon) return cat.icon
  const icons: Record<string, string> = {
    'air_express': 'bi bi-lightning-charge',
    'air_normal': 'bi bi-airplane',
    'sea': 'bi bi-water'
  }
  return icons[mode] || 'bi bi-truck'
}

const getModeLabel = (mode: string) => {
  // Chercher d'abord le label dans les catégories MEX
  const cat = mexModes.value.find((c: any) => c.code === mode || c.slug === mode)
  if (cat?.label) return cat.label
  const labels: Record<string, Record<string, string>> = {
    'air_express': { fr: 'Aerien Express', en: 'Express Air' },
    'air_normal': { fr: 'Aerien Standard', en: 'Standard Air' },
    'sea': { fr: 'Maritime', en: 'Sea' }
  }
  return labels[mode]?.[locale.value] || labels[mode]?.['fr'] || mode
}

const calculateCost = () => {
  if (!canCalculate.value) return

  const shippingCost = shippingStore.calculateShippingCost(
    form.destination,
    form.weight!,
    form.shippingMode!
  )

  const insurance = shippingCost * 0.01
  const handling = 5000 // Fixed handling fee

  result.value = {
    shippingCost,
    insurance,
    handling,
    total: shippingCost + insurance + handling
  }
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>

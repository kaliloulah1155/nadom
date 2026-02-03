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
                    <option v-for="dest in destinations" :key="dest.id" :value="dest.country">
                      {{ dest.flag }} {{ dest.country }} - {{ dest.city }}
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
                        @click="form.shippingMode = mode.mode"
                      >
                        <div class="card-body text-center py-3">
                          <i
                            :class="[getModeIcon(mode.mode), 'fs-3 mb-2', { 'text-primary': form.shippingMode === mode.mode }]"
                          ></i>
                          <h6 class="mb-1">{{ getModeLabel(mode.mode) }}</h6>
                          <small class="text-muted d-block">{{ mode.duration }}</small>
                          <strong class="text-primary">{{ formatCurrency(mode.costPerKg) }}/kg</strong>
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
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({
  layout: 'default'
})

const { t, locale } = useI18n()
const shippingStore = useShippingStore()
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

// Load destinations
onMounted(async () => {
  await shippingStore.fetchDestinations()
})

const destinations = computed(() => shippingStore.destinations)

const availableModes = computed(() => {
  if (!form.destination) return []
  return shippingStore.getShippingModes(form.destination)
})

const canCalculate = computed(() => {
  return form.destination && form.shippingMode && form.weight && form.weight > 0
})

const onDestinationChange = () => {
  form.shippingMode = null
  result.value = null
}

const getModeIcon = (mode: ShippingMode) => {
  const icons: Record<ShippingMode, string> = {
    'air_express': 'bi bi-lightning-charge',
    'air_normal': 'bi bi-airplane',
    'sea': 'bi bi-water'
  }
  return icons[mode]
}

const getModeLabel = (mode: ShippingMode) => {
  const labels: Record<ShippingMode, Record<string, string>> = {
    'air_express': { fr: 'Aerien Express', en: 'Express Air' },
    'air_normal': { fr: 'Aerien Standard', en: 'Standard Air' },
    'sea': { fr: 'Maritime', en: 'Sea' }
  }
  return labels[mode][locale.value] || labels[mode]['fr']
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

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
                <!-- Destination (uniquement destinations configurées côté API — id requis pour /shipping/calculate) -->
                <div class="mb-4">
                  <label class="form-label fw-medium d-flex align-items-center gap-2">
                    {{ t('calculator.destinationCountry') }}
                    <span v-if="shippingStore.loadingDestinations" class="spinner-border spinner-border-sm text-primary" style="width: .9rem; height: .9rem;" role="status" aria-hidden="true"></span>
                  </label>
                  <select
                    v-model="form.destinationId"
                    class="form-select form-select-lg"
                    required
                    :disabled="shippingStore.loadingDestinations"
                    @change="onDestinationChange"
                  >
                    <option value="">{{ shippingStore.loadingDestinations ? t('calculator.loading') : t('calculator.selectCountry') }}</option>
                    <option v-for="dest in destinationOptions" :key="dest.id" :value="dest.id">
                      {{ destinationOptionText(dest) }}
                    </option>
                  </select>
                  <div
                    v-if="form.destinationId && selectedDestOpt"
                    class="d-flex align-items-center gap-2 mt-2 text-muted small"
                  >
                    <CountryFlag
                      :iso="selectedDestinationIso"
                      :emoji="selectedDestOpt.flag"
                      :label="selectedDestinationLabel"
                      size="1.35rem"
                    />
                    <span>{{ selectedDestinationLabel }}</span>
                  </div>
                  <small v-if="destinationOptions.length === 0 && destinationsReady" class="text-muted d-block mt-1">
                    {{ t('calculator.noDestinations') }}
                  </small>
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
                          <strong v-if="modeCostPerKg(mode) > 0" class="text-primary">{{ fmtMoney(modeCostPerKg(mode)) }}/kg</strong>
                          <small v-else-if="form.destinationId" class="text-muted d-block">{{ t('calculator.rateNotConfigured') }}</small>
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

                <div v-if="calcError" class="alert alert-danger mb-4" role="alert">{{ calcError }}</div>

                <!-- Calculate Button -->
                <button
                  type="submit"
                  class="btn btn-primary btn-lg w-100"
                  :disabled="!canCalculate || calculating"
                >
                  <span v-if="calculating" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  <i v-else class="bi bi-calculator me-2"></i>{{ calculating ? t('calculator.calculating') : t('calculator.calculate') }}
                </button>
              </form>

              <!-- Result (données POST /api/shipping/calculate — meme logique que le backend) -->
              <div v-if="result" class="mt-5 pt-4 border-top">
                <h5 class="fw-bold mb-4">
                  {{ t('calculator.costEstimate') }}
                  <span class="badge bg-secondary-subtle text-secondary ms-2">{{ quoteCurrencyDisplay }}</span>
                </h5>

                <div class="card bg-light border-0 mb-4">
                  <div class="card-body">
                    <div class="row text-center">
                      <div class="col-4">
                        <small class="text-muted d-block">{{ t('calculator.destination') }}</small>
                        <div class="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                          <CountryFlag
                            v-if="selectedDestOpt"
                            :iso="selectedDestinationIso"
                            :emoji="selectedDestOpt.flag"
                            :label="selectedDestinationLabel"
                            size="1.4rem"
                          />
                          <strong>{{ selectedDestinationLabel }}</strong>
                        </div>
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
                    <tr v-if="result.duration">
                      <td>{{ t('calculator.estimatedDelay') }}</td>
                      <td class="text-end">{{ result.duration }}</td>
                    </tr>
                    <tr>
                      <td>{{ t('calculator.ratePerKg') }}</td>
                      <td class="text-end">{{ fmtMoney(result.cost_per_kg, result.currency_code) }}</td>
                    </tr>
                    <tr>
                      <td>{{ t('calculator.shippingCost') }}</td>
                      <td class="text-end">{{ fmtMoney(result.cost, result.currency_code) }}</td>
                    </tr>
                    <tr class="text-muted small">
                      <td colspan="2">{{ t('calculator.rateDetail', { rate: fmtMoney(result.cost_per_kg, result.currency_code), weight: result.weight }) }}</td>
                    </tr>
                    <tr class="border-top fw-bold fs-5">
                      <td>{{ t('calculator.totalEstimate') }}</td>
                      <td class="text-end text-primary">{{ fmtMoney(result.cost, result.currency_code) }}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="alert alert-info mb-0">
                  <i class="bi bi-info-circle me-2"></i>
                  <small>{{ t('calculator.currencyScopeNote') }} {{ t('calculator.customsNote') }}</small>
                </div>

                <div class="d-grid gap-2">
                  <a
                    :href="whatsappQuoteHref"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-success"
                  >
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
import { useCountriesStore } from '~/stores/countries'
import { useShippingStore, type ShippingCalculateResult, type ShippingMode } from '~/stores/shipping'
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({
  layout: 'default'
})

const { t, locale } = useI18n()
const runtimeConfig = useRuntimeConfig()
const shippingStore = useShippingStore()
const countriesStore = useCountriesStore()
const { formatCurrency } = useFormatters()

const intlLocale = computed(() => {
  if (locale.value === 'en') return 'en-US'
  if (locale.value === 'zh') return 'zh-CN'
  return 'fr-FR'
})

/** Devise de la ligne sélectionnée (liste `/destinations/all`). */
const selectedDestinationCurrency = computed(() => {
  const id = form.destinationId
  const d = shippingStore.destinations.find(x => String(x.id) === String(id))
  const raw = d?.currency_code
  return (raw && String(raw).trim()) ? String(raw).toUpperCase() : 'XOF'
})

const quoteCurrencyDisplay = computed(() => {
  const code = result.value?.currency_code || selectedDestinationCurrency.value
  return code.toUpperCase()
})

function fmtMoney(amount: number, currencyOverride?: string) {
  const cur = (currencyOverride || selectedDestinationCurrency.value || 'XOF').toUpperCase()
  return formatCurrency(amount, cur, intlLocale.value)
}

const form = reactive({
  destinationId: '',
  shippingMode: null as ShippingMode | null,
  weight: null as number | null
})

const result = ref<ShippingCalculateResult | null>(null)
const calculating = ref(false)
const calcError = ref<string | null>(null)
const destinationsReady = ref(false)

/** Numéro WhatsApp (chiffres uniquement) pour wa.me */
const whatsappDigits = computed(() =>
  String(runtimeConfig.public.whatsapp ?? '').replace(/\D/g, '')
)

/**
 * Lien WhatsApp avec message par défaut reprenant les éléments du calculateur
 * (destination, mode, poids, tarif au kg, total, devise, délai si présent).
 */
const whatsappQuoteHref = computed(() => {
  const raw = whatsappDigits.value
  if (!raw) return '#'

  const r = result.value
  if (!r) return `https://wa.me/${raw}`

  const lines: string[] = [
    t('calculator.whatsappQuoteGreeting'),
    '',
    t('calculator.whatsappQuoteIntro'),
    '',
    `${t('calculator.whatsappQuoteBullet')} ${t('calculator.destination')}: ${selectedDestinationLabel.value}`,
    `${t('calculator.whatsappQuoteBullet')} ${t('calculator.mode')}: ${getModeLabel(form.shippingMode!)}`,
    `${t('calculator.whatsappQuoteBullet')} ${t('calculator.weight')}: ${r.weight} kg`,
    `${t('calculator.whatsappQuoteBullet')} ${t('calculator.ratePerKg')}: ${fmtMoney(r.cost_per_kg, r.currency_code)}`,
    `${t('calculator.whatsappQuoteBullet')} ${t('calculator.totalEstimate')}: ${fmtMoney(r.cost, r.currency_code)} (${(r.currency_code || quoteCurrencyDisplay.value).toUpperCase()})`,
  ]

  if (r.duration) {
    lines.push(
      `${t('calculator.whatsappQuoteBullet')} ${t('calculator.estimatedDelay')}: ${r.duration}`
    )
  }

  lines.push('', t('calculator.whatsappQuoteClosing'))

  return `https://wa.me/${raw}?text=${encodeURIComponent(lines.join('\n'))}`
})

onMounted(async () => {
  await Promise.all([shippingStore.fetchDestinations(), countriesStore.fetchAll()])
  destinationsReady.value = true
})

const destinationOptions = computed(() =>
  (shippingStore.destinations || []).map((d: any) => ({
    id: d.id,
    country: d.country,
    city: d.city,
    flag: d.flag,
  }))
)

function destinationOptionText(dest: { flag?: string; country?: string; city?: string }) {
  const parts = [
    dest.flag ? `${dest.flag} ` : '',
    dest.country || '',
    dest.city ? ` - ${dest.city}` : '',
  ]
  return parts.join('')
}

const selectedDestOpt = computed(() => {
  const id = form.destinationId
  if (!id) return null
  return destinationOptions.value.find(o => String(o.id) === String(id)) || null
})

const selectedDestinationIso = computed(() =>
  countriesStore.iso3166FromCountryField(selectedDestOpt.value?.country)
)

const selectedDestinationLabel = computed(() => {
  const d = selectedDestOpt.value
  if (!d?.country) return ''
  return d.city ? `${d.country} - ${d.city}` : d.country
})

const availableModes = computed(() => {
  if (!form.destinationId) return []
  return shippingStore.getShippingModesByDestinationId(form.destinationId)
})

const canCalculate = computed(() =>
  Boolean(form.destinationId && form.shippingMode && form.weight && form.weight > 0)
)

const onDestinationChange = () => {
  form.shippingMode = null
  result.value = null
  calcError.value = null
}

const getModeIcon = (mode: string) => {
  const icons: Record<string, string> = {
    air_express: 'bi bi-lightning-charge',
    air_normal: 'bi bi-airplane',
    sea: 'bi bi-water',
  }
  return icons[mode] || 'bi bi-truck'
}

const getModeLabel = (mode: string) => {
  const labels: Record<string, Record<string, string>> = {
    air_express: { fr: 'Aérien express', en: 'Express air', zh: '空运快递' },
    air_normal: { fr: 'Aérien standard', en: 'Standard air', zh: '标准空运' },
    sea: { fr: 'Maritime', en: 'Sea freight', zh: '海运' },
  }
  const loc = locale.value === 'zh' ? 'zh' : locale.value === 'en' ? 'en' : 'fr'
  return labels[mode]?.[loc] || labels[mode]?.fr || mode
}

/** Lit le tarif au kg même si l'API renvoie snake_case sans normalisation côté liste. */
function modeCostPerKg(mode: { mode?: string; costPerKg?: number; cost_per_kg?: number }) {
  const v = mode.costPerKg ?? mode.cost_per_kg
  return Number(v) || 0
}

const calculateCost = async () => {
  if (!canCalculate.value) return
  calculating.value = true
  calcError.value = null
  result.value = null

  const res = await shippingStore.calculateShippingQuote({
    destination_id: form.destinationId,
    mode: form.shippingMode!,
    weight: form.weight!,
  })

  calculating.value = false

  if (!res.success || !res.data) {
    calcError.value = res.message || t('calculator.calcFailed')
    return
  }

  const d = res.data as ShippingCalculateResult
  const destCur =
    (d.currency_code && String(d.currency_code)) ||
    (d.destination && typeof d.destination === 'object' && (d.destination as any).currency_code) ||
    selectedDestinationCurrency.value
  result.value = {
    ...d,
    cost_per_kg: Number(d.cost_per_kg),
    cost: Number(d.cost),
    weight: Number(d.weight),
    currency_code: String(destCur || 'XOF').toUpperCase(),
  }
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>

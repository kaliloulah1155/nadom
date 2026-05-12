<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
      <div class="flex-grow-1" style="min-width: 0;">
        <h4 class="mb-1">Rapports & Statistiques</h4>
        <p class="text-muted mb-0">Analyse des performances et activités</p>
      </div>
      <div class="d-flex gap-2 ms-md-auto flex-shrink-0">
        <button class="btn btn-outline-primary" :disabled="reportsStore.exporting" @click="onExport('pdf')">
          <span v-if="reportsStore.exporting && exportingFormat === 'pdf'" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-download me-2"></i>Exporter PDF
        </button>
        <button class="btn btn-primary" :disabled="reportsStore.exporting" @click="onExport('excel')">
          <span v-if="reportsStore.exporting && exportingFormat === 'excel'" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-file-earmark-excel me-2"></i>Exporter Excel
        </button>
      </div>
    </div>

    <!-- Country filter -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body py-3">
        <div class="row g-2 align-items-end">
          <div class="col-md-6">
            <label class="form-label small text-muted mb-1 d-flex align-items-center gap-2">
              Pays de livraison
              <span v-if="shippingStore.loadingDestinations" class="spinner-border spinner-border-sm text-primary" style="width: .8rem; height: .8rem;" role="status" aria-hidden="true"></span>
            </label>
            <select
              v-model="countryFilter"
              class="form-select form-select-sm"
              :disabled="shippingStore.loadingDestinations || reportsStore.statsLoading"
              @change="onCountryChange"
            >
              <option value="">{{ shippingStore.loadingDestinations ? 'Chargement…' : '🌍 Toutes destinations' }}</option>
              <option v-for="dest in countryOptions" :key="dest.id" :value="dest.country">
                {{ (dest.flag ? `${dest.flag} ` : '') }}{{ dest.country }}{{ dest.currency_code ? ` — ${dest.currency_code}` : '' }}
              </option>
            </select>
            <small v-if="countryFilter" class="text-muted">
              Volume d'affaires des expéditions livrées vers <strong>{{ countryFilter }}</strong>, exprimé en {{ revenueCurrency }}.
            </small>
            <small v-else class="text-muted">
              Filtre désactivé — total mondial agrégé en FCFA (les montants multi-devises sont sommés bruts).
            </small>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="row g-4 mb-4">
      <div class="col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h6 class="text-muted small">Volume d'affaires</h6>
            <h4 class="mb-0">{{ formatRevenue(reportsStore.overview?.revenue.current) }}</h4>
            <small :class="trendClass(reportsStore.overview?.revenue.trend)">
              <i :class="trendIcon(reportsStore.overview?.revenue.trend)"></i>
              {{ formatPercent(reportsStore.overview?.revenue.percent_change) }} vs mois dernier
            </small>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h6 class="text-muted small">Demandes traitées</h6>
            <h4 class="mb-0">{{ reportsStore.overview?.requests_handled.current ?? 0 }}</h4>
            <small :class="trendClass(reportsStore.overview?.requests_handled.trend)">
              <i :class="trendIcon(reportsStore.overview?.requests_handled.trend)"></i>
              {{ formatPercent(reportsStore.overview?.requests_handled.percent_change) }} vs mois dernier
            </small>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h6 class="text-muted small">Nouveaux clients</h6>
            <h4 class="mb-0">{{ reportsStore.overview?.new_clients.current ?? 0 }}</h4>
            <small :class="trendClass(reportsStore.overview?.new_clients.trend)">
              <i :class="trendIcon(reportsStore.overview?.new_clients.trend)"></i>
              {{ formatPercent(reportsStore.overview?.new_clients.percent_change) }} vs mois dernier
            </small>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h6 class="text-muted small">Taux de satisfaction</h6>
            <h4 class="mb-0">{{ reportsStore.overview?.satisfaction.rate ?? 0 }}/{{ reportsStore.overview?.satisfaction.scale ?? 5 }}</h4>
            <small class="text-success"><i class="bi bi-check-circle me-1"></i>{{ reportsStore.overview?.satisfaction.label || 'Stable' }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Reports Section -->
    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-transparent d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Évolution mensuelle</h5>
            <select v-model.number="months" class="form-select form-select-sm" style="width: 150px;" @change="onMonthsChange">
              <option :value="12">Derniers 12 mois</option>
              <option :value="6">Derniers 6 mois</option>
              <option :value="3">Derniers 3 mois</option>
            </select>
          </div>
          <div class="card-body">
            <div v-if="reportsStore.statsLoading && !reportsStore.monthly" class="text-center py-5">
              <div class="spinner-border text-primary"></div>
            </div>
            <div v-else id="chart"></div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-transparent">
            <h5 class="mb-0">Top Destinations</h5>
          </div>
          <div class="card-body">
            <div v-if="reportsStore.statsLoading && reportsStore.destinations.length === 0" class="text-center py-4">
              <div class="spinner-border spinner-border-sm text-primary"></div>
            </div>
            <div v-else-if="reportsStore.destinations.length === 0" class="text-center text-muted py-4">
              Aucune donnée
            </div>
            <div v-for="dest in reportsStore.destinations" :key="dest.name" class="mb-3">
              <div class="d-flex justify-content-between mb-1">
                <small>{{ dest.name }}</small>
                <small class="fw-medium">{{ dest.percent }}%</small>
              </div>
              <div class="progress" style="height: 6px;">
                <div class="progress-bar" :style="{ width: dest.percent + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch, nextTick } from 'vue'
import { useReportsStore } from '~/stores/reports'
import { useShippingStore } from '~/stores/shipping'
import { useNotification } from '~/composables/useNotification'
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({
  layout: 'admin'
})

const reportsStore = useReportsStore()
const shippingStore = useShippingStore()
const { error: notifyError } = useNotification()
const { formatCurrency } = useFormatters()

const months = ref(12)
const countryFilter = ref<string>('')
const exportingFormat = ref<'pdf' | 'excel' | null>(null)
let chartInstance: any = null

/** Liste des destinations actives, triées alphabétiquement par pays. */
const countryOptions = computed(() => {
  return [...shippingStore.destinations]
    .filter(d => d.country)
    .sort((a, b) => (a.country || '').localeCompare(b.country || ''))
})

/** Devise utilisée pour afficher le volume d'affaires (renvoyée par l'API selon le filtre). */
const revenueCurrency = computed(() => {
  return (reportsStore.overview?.revenue?.currency_code || 'XOF').toUpperCase()
})

const formatRevenue = (val?: number) => {
  if (val == null) return formatCurrency(0, revenueCurrency.value)
  return formatCurrency(val, revenueCurrency.value)
}

const formatPercent = (val?: number) => {
  if (val == null) return '0%'
  return `${Math.abs(val).toFixed(1)}%`
}

const trendClass = (trend?: string) => {
  if (trend === 'up') return 'text-success'
  if (trend === 'down') return 'text-danger'
  return 'text-muted'
}

const trendIcon = (trend?: string) => {
  if (trend === 'up') return 'bi bi-arrow-up me-1'
  if (trend === 'down') return 'bi bi-arrow-down me-1'
  return 'bi bi-dash me-1'
}

const renderChart = async () => {
  await nextTick()
  if (typeof window === 'undefined' || !(window as any).ApexCharts) return
  const el = document.querySelector('#chart')
  if (!el) return

  const labels = reportsStore.monthly?.labels || []
  const data = reportsStore.monthly?.data || []

  const seriesName = `Volume d'affaires (${revenueCurrency.value})`

  const options = {
    series: [{ name: seriesName, data }],
    chart: { height: 350, type: 'area', toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', colors: ['#c71f37'] },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.9, stops: [0, 90, 100],
        colorStops: [
          { offset: 0, color: '#c71f37', opacity: 0.2 },
          { offset: 100, color: '#c71f37', opacity: 0 },
        ],
      },
    },
    xaxis: { categories: labels },
    tooltip: { y: { formatter: (v: number) => formatCurrency(v, revenueCurrency.value) } },
  }

  if (chartInstance) {
    chartInstance.updateOptions({ series: [{ name: seriesName, data }], xaxis: { categories: labels } })
  } else {
    chartInstance = new (window as any).ApexCharts(el, options)
    chartInstance.render()
  }
}

const onMonthsChange = async () => {
  await reportsStore.fetchStats(months.value, countryFilter.value || null)
  renderChart()
}

const onCountryChange = async () => {
  await reportsStore.fetchStats(months.value, countryFilter.value || null)
  renderChart()
}

const onExport = async (format: 'pdf' | 'excel') => {
  exportingFormat.value = format
  try {
    await reportsStore.exportStats(format)
  } catch (err: any) {
    notifyError(err.message || `Erreur export ${format}`)
  } finally {
    exportingFormat.value = null
  }
}

watch(() => reportsStore.monthly, () => renderChart(), { deep: true })

onMounted(async () => {
  await Promise.all([
    reportsStore.fetchStats(months.value, countryFilter.value || null),
    shippingStore.fetchDestinations(),
  ])
  renderChart()
})
</script>

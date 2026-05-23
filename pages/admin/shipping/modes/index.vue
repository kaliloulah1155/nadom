<template>
  <div>
    <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
      <div class="flex-grow-1" style="min-width: 0;">
        <h4 class="mb-1">{{ t('admin.shippingModes.title') }}</h4>
        <p class="text-muted mb-0">
          {{ t('admin.shippingModes.subtitle') }}
        </p>
      </div>
      <div class="d-flex gap-2 ms-md-auto flex-shrink-0">
        <NuxtLink to="/admin/destinations" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-geo-alt me-1"></i>{{ t('admin.shippingModes.linkDestinations') }}
        </NuxtLink>
        <button v-can="['create', 'shipping-modes']" type="button" class="btn btn-primary" @click="openModal()">
          <i class="bi bi-plus-lg me-2"></i>{{ t('admin.shippingModes.newRate') }}
        </button>
      </div>
    </div>

    <div class="card border-0 shadow-sm mb-3">
      <div class="card-body py-3">
        <div class="row g-2 align-items-end">
          <div class="col-md-5">
            <label class="form-label small text-muted mb-1 d-flex align-items-center gap-2">
              {{ t('admin.shippingModes.filterByCountry') }}
              <span v-if="countriesStore.loading" class="spinner-border spinner-border-sm text-primary" style="width: .8rem; height: .8rem;" role="status" aria-hidden="true"></span>
            </label>
            <select v-model="filterCountryUuid" class="form-select form-select-sm" :disabled="countriesStore.loading" @change="reload(1)">
              <option value="">{{ countriesStore.loading ? t('admin.shippingModes.loadingCountriesEllipsis') : t('admin.common.allNeutral') }}</option>
              <option v-for="opt in destinationChoices" :key="opt.id" :value="opt.id">
                {{ opt.flag ? `${opt.flag} ` : '' }}{{ opt.country }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted mb-1">{{ t('admin.shipments.mode') }}</label>
            <select v-model="filterMode" class="form-select form-select-sm" @change="reload(1)">
              <option value="">{{ t('admin.common.allNeutral') }}</option>
              <option value="air_express">{{ t('admin.shippingModes.airExpress') }}</option>
              <option value="air_normal">{{ t('admin.shippingModes.airStandard') }}</option>
              <option value="sea">{{ t('admin.shippingModes.boat') }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div v-if="cfg.loadingModes && cfg.modes.length === 0" class="card-body text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>
      <div v-else class="table-responsive">
        <table class="table table-hover mb-0 align-middle">
          <thead class="table-light">
            <tr>
              <th>{{ t('admin.shippingModes.destinationCol') }}</th>
              <th>{{ t('admin.shipments.mode') }}</th>
              <th>{{ t('admin.shippingModes.indicativeDelay') }}</th>
              <th>{{ t('admin.shippingModes.ratePerKg') }}</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="cfg.modes.length === 0">
              <td colspan="5" class="text-center py-5 text-muted">
                {{ t('admin.shippingModes.noRatesHint') }}
              </td>
            </tr>
            <tr v-for="m in cfg.modes" :key="m.id">
              <td>
                <span class="d-inline-flex align-items-center gap-2 flex-wrap">
                  <CountryFlag
                    :iso="countriesStore.iso3166FromCountryField(destinationCountryPlain(m))"
                    :emoji="destinationEmojiPlain(m)"
                    :label="destinationCountryPlain(m)"
                    size="1.25rem"
                  />
                  <span>{{ destinationPlainLabel(m) }}</span>
                </span>
              </td>
              <td><span class="badge bg-dark-subtle text-dark">{{ modeLabel(m.mode) }}</span></td>
              <td>{{ m.duration || '—' }}</td>
              <td class="fw-medium">{{ formatModeMoney(m) }}</td>
              <td class="text-end">
                <button v-can="['update', 'shipping-modes']" type="button" class="btn btn-sm btn-outline-primary me-1" @click="openModal(m)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button v-can="['delete', 'shipping-modes']" type="button" class="btn btn-sm btn-outline-danger" @click="onDelete(m)">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          v-model:current-page="cfg.modesMeta.currentPage"
          v-model:limit="cfg.modesMeta.perPage"
          :total-items="cfg.modesMeta.total"
          @update:current-page="(p: number) => reload(p)"
          @update:limit="(l: number) => reload(1, l)"
        />
      </div>
    </div>

    <div id="modeModal" ref="modalRef" class="modal fade" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editing ? t('admin.shippingModes.modalEdit') : t('admin.shippingModes.modalNew') }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" :aria-label="t('admin.common.close')"></button>
          </div>
          <form @submit.prevent="save">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label d-flex align-items-center gap-2">
                  {{ t('admin.shippingModes.destinationCountryLabel') }}
                  <span v-if="countriesStore.loading" class="spinner-border spinner-border-sm text-primary" style="width: .85rem; height: .85rem;" role="status" aria-hidden="true"></span>
                </label>
                <select v-model="form.country_uuid" class="form-select" required :disabled="Boolean(editing) || countriesStore.loading">
                  <option value="" disabled>{{ countriesStore.loading ? t('admin.shippingModes.loadingCountriesEllipsis') : t('admin.shippingModes.chooseCountry') }}</option>
                  <option v-for="opt in destinationChoices" :key="opt.id" :value="opt.id">
                    {{ opt.flag ? `${opt.flag} ` : '' }}{{ opt.country }}
                  </option>
                </select>
                <small v-if="editing" class="text-muted">{{ t('admin.shippingModes.cannotChangeCountryHint') }}</small>
              </div>
              <div class="mb-3">
                <label class="form-label">{{ t('admin.shipments.mode') }} *</label>
                <select v-model="form.mode" class="form-select" required :disabled="Boolean(editing)">
                  <option value="" disabled>{{ t('admin.shippingModes.chooseMode') }}</option>
                  <option value="air_express">{{ t('admin.shippingModes.airExpress') }}</option>
                  <option value="air_normal">{{ t('admin.shippingModes.airStandard') }}</option>
                  <option value="sea">{{ t('admin.shippingModes.boat') }}</option>
                </select>
                <small v-if="editing" class="text-muted">{{ t('admin.shippingModes.cannotChangeModeHint') }}</small>
              </div>
              <div class="mb-3">
                <label class="form-label">{{ t('admin.shippingModes.indicativeDelay') }}</label>
                <input v-model="form.duration" type="text" class="form-control" :placeholder="t('admin.shippingModes.delayExample')" />
              </div>
              <div class="mb-0">
                <label class="form-label">{{ t('admin.shippingModes.costPerKg') }} *</label>
                <input v-model.number="form.cost_per_kg" type="number" class="form-control" min="0" step="0.01" required />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ t('admin.common.cancel') }}</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                {{ t('admin.common.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

import { ref, reactive, computed, onMounted } from 'vue'
import { useCountriesStore } from '~/stores/countries'
import { useShippingConfigStore, type AdminDestinationRow, type AdminShippingModeRow } from '~/stores/shippingConfig'
import { useNotification } from '~/composables/useNotification'
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

const cfg = useShippingConfigStore()
const countriesStore = useCountriesStore()
const { success, error: notifyError } = useNotification()
const { formatCurrency } = useFormatters()

const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null
const editing = ref<AdminShippingModeRow | null>(null)
const saving = ref(false)

const existingDestinations = ref<AdminDestinationRow[]>([])
const filterCountryUuid = ref('')
const filterMode = ref('')

/** Source du dropdown : tous les pays actifs (table countries, sans pagination). */
const destinationChoices = computed<AdminDestinationRow[]>(() =>
  countriesStore.activeCountries.map(c => ({
    id: c.uuid,
    country: c.name_fr || c.label || c.code,
    continent: c.continent || null,
    city: null,
    flag: c.flag_emoji || null,
    currency_code: c.currency_code || null,
    is_active: true,
  }))
)

const form = reactive({
  country_uuid: '',
  mode: '' as '' | 'air_express' | 'air_normal' | 'sea',
  duration: '',
  cost_per_kg: 0 as number,
})

const modeLabel = (code: string) => {
  const map: Record<string, string> = {
    air_express: 'Avion express',
    air_normal: 'Avion standard',
    sea: 'Bateau',
  }
  return map[code] || code
}

/** Devise affichée : relation API → destination correspondante → pays sélectionné → XOF. */
const formatModeMoney = (m: AdminShippingModeRow) => {
  const fromRel = (m.destination as AdminDestinationRow | undefined)?.currency_code
  const fromDest = existingDestinations.value.find(d => d.id === m.destination_id)?.currency_code
  const code = String(fromRel || fromDest || 'XOF').toUpperCase()
  return formatCurrency(Number(m.cost_per_kg) || 0, code)
}

const destinationCountryPlain = (m: AdminShippingModeRow) => {
  const rel = m.destination as AdminDestinationRow | undefined
  const country =
    (rel?.country || '').trim() ||
    (existingDestinations.value.find(d => d.id === m.destination_id)?.country || '').trim()
  return country
}

const destinationEmojiPlain = (m: AdminShippingModeRow) => {
  const rel = m.destination as AdminDestinationRow | undefined
  const emoji =
    rel?.flag || existingDestinations.value.find(d => d.id === m.destination_id)?.flag || ''
  return (emoji || '').trim()
}

const destinationPlainLabel = (m: AdminShippingModeRow) => {
  const rel = m.destination as AdminDestinationRow | undefined
  if (rel?.country) return `${rel.country}${rel.city ? ` · ${rel.city}` : ''}`
  const found = existingDestinations.value.find(d => d.id === m.destination_id)
  if (found?.country) return `${found.country}${found.city ? ` · ${found.city}` : ''}`
  return String(m.destination_id || '—')
}

/** Convertit le pays sélectionné dans le filtre en destination_id (s'il existe une destination pour ce pays). */
const resolveFilterDestinationId = () => {
  if (!filterCountryUuid.value) return null
  const country = countriesStore.activeCountries.find(c => c.uuid === filterCountryUuid.value)
  if (!country) return null
  const name = (country.name_fr || country.label || country.code || '').trim().toLowerCase()
  const dest = existingDestinations.value.find(d => (d.country || '').trim().toLowerCase() === name)
  return dest?.id || '__none__'
}

const reload = async (page = cfg.modesMeta.currentPage, limit = cfg.modesMeta.perPage) => {
  const resolved = resolveFilterDestinationId()
  if (resolved === '__none__') {
    cfg.modes.splice(0, cfg.modes.length)
    cfg.modesMeta.total = 0
    cfg.modesMeta.currentPage = 1
    cfg.modesMeta.lastPage = 1
    return
  }
  await cfg.fetchModes({
    page,
    limit,
    destination_id: resolved,
    mode: filterMode.value || null,
  })
}

const loadChoices = async () => {
  existingDestinations.value = await cfg.fetchAllDestinationsForSelect()
}

const resetForm = () => {
  form.country_uuid = ''
  form.mode = ''
  form.duration = ''
  form.cost_per_kg = 0
}

const openModal = (row?: AdminShippingModeRow) => {
  if (row?.id) {
    editing.value = row
    // Retrouver le pays correspondant via le libellé country de la destination
    const destCountry = (row.destination?.country || existingDestinations.value.find(d => d.id === row.destination_id)?.country || '')
      .trim()
      .toLowerCase()
    const country = countriesStore.activeCountries.find(c =>
      [c.name_fr, c.name_en, c.label, c.code].some(v => (v || '').trim().toLowerCase() === destCountry)
    )
    form.country_uuid = country?.uuid || ''
    form.mode = (row.mode || '') as typeof form.mode
    form.duration = row.duration || ''
    form.cost_per_kg = Number(row.cost_per_kg) || 0
  } else {
    editing.value = null
    resetForm()
  }
  modalInstance?.show()
}

/** Trouve une destination existante pour ce pays, sinon en crée une avec les défauts du pays. */
const findOrCreateDestinationForCountry = async (countryUuid: string): Promise<string> => {
  const country = countriesStore.activeCountries.find(c => c.uuid === countryUuid)
  if (!country) throw new Error('Pays introuvable.')
  const countryName = (country.name_fr || country.label || country.code || '').trim()
  if (!countryName) throw new Error('Pays sans libellé.')

  const match = existingDestinations.value.find(d => (d.country || '').trim().toLowerCase() === countryName.toLowerCase())
  if (match) return match.id

  const created = await cfg.createDestination({
    country: countryName,
    continent: country.continent || null,
    flag: country.flag_emoji || null,
    currency_code: country.currency_code || null,
    is_active: true,
  })
  if (!created?.id) throw new Error('Échec de la création de la destination.')
  existingDestinations.value.push(created)
  return created.id
}

const save = async () => {
  saving.value = true
  try {
    if (editing.value) {
      await cfg.updateMode(editing.value.id, {
        duration: form.duration.trim() || null,
        cost_per_kg: form.cost_per_kg,
      })
      success(t('admin.shippingModes.updated'))
    } else {
      if (!form.country_uuid) throw new Error('Choisissez un pays.')
      const destinationId = await findOrCreateDestinationForCountry(form.country_uuid)
      await cfg.createMode({
        destination_id: destinationId,
        mode: form.mode,
        duration: form.duration.trim() || null,
        cost_per_kg: form.cost_per_kg,
      })
      success(t('admin.shippingModes.created'))
    }
    modalInstance?.hide()
    await reload(1)
  } catch (e: any) {
    notifyError(e.message || t('admin.messages.genericError'))
  } finally {
    saving.value = false
  }
}

const onDelete = async (m: AdminShippingModeRow) => {
  if (!confirm(t('admin.confirm.deleteRate'))) return
  try {
    await cfg.deleteMode(m.id)
    success(t('admin.shippingModes.deleted'))
    await reload()
  } catch (e: any) {
    notifyError(e.message || t('admin.messages.genericError'))
  }
}

onMounted(async () => {
  await Promise.all([countriesStore.fetchAll(), loadChoices()])
  await reload(1)
  if (typeof window !== 'undefined' && (window as any).bootstrap && modalRef.value) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})
</script>

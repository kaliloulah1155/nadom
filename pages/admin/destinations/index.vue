<template>
  <div>
    <div class="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-3">
      <div class="flex-grow-1" style="min-width: 0;">
        <h4 class="mb-1">{{ t('admin.destinations.title') }}</h4>
        <p class="text-muted mb-0">
          {{ t('admin.destinations.subtitle') }}
        </p>
      </div>
      <div class="d-flex gap-2 ms-md-auto flex-shrink-0 align-items-center">
        <NuxtLink to="/import-export/calculator" class="btn btn-outline-secondary btn-sm" target="_blank">
          <i class="bi bi-box-arrow-up-right me-1"></i>{{ t('admin.destinations.viewCalculator') }}
        </NuxtLink>
      </div>
    </div>

    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <button
          type="button"
          class="nav-link"
          :class="{ active: activeTab === 'freight' }"
          @click="activeTab = 'freight'"
        >
          {{ t('admin.destinations.freightDestinations') }}
        </button>
      </li>
      <li class="nav-item">
        <button
          type="button"
          class="nav-link"
          :class="{ active: activeTab === 'vitrine' }"
          @click="activeTab = 'vitrine'"
        >
          {{ t('admin.destinations.countriesPage') }}
        </button>
      </li>
    </ul>

    <!-- Onglet : destinations fret -->
    <div v-show="activeTab === 'freight'">
      <div class="d-flex justify-content-end mb-2">
        <button v-can="['create', 'destinations']" type="button" class="btn btn-primary btn-sm" @click="openModal()">
          <i class="bi bi-plus-lg me-2"></i>{{ t('admin.destinations.newDestination') }}
        </button>
      </div>

      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body py-3">
          <div class="row g-2 align-items-end">
            <div class="col-md-5">
              <label class="form-label small text-muted mb-1 d-flex align-items-center gap-2">
                {{ t('admin.countries.country') }}
                <span v-if="countriesStore.loading" class="spinner-border spinner-border-sm text-primary" style="width: .8rem; height: .8rem;" role="status" aria-hidden="true"></span>
              </label>
              <template v-if="canListCountries">
                <select v-model="filterCountryUuid" class="form-select form-select-sm" :disabled="countriesStore.loading" @change="reload(1)">
                  <option value="">{{ countriesStore.loading ? t('admin.destinations.loadingCountriesEllipsis') : t('admin.destinations.allCountriesFilter') }}</option>
                  <option v-for="c in allCountriesSorted" :key="c.uuid" :value="c.uuid">
                    {{ (c.flag_emoji ? `${c.flag_emoji} ` : '') + countryLabel(c) }}
                  </option>
                </select>
              </template>
              <template v-else>
                <select class="form-select form-select-sm" disabled>
                  <option>{{ countriesStore.loading ? t('admin.destinations.loadingCountriesEllipsis') : t('admin.destinations.countriesAccessDenied') }}</option>
                </select>
              </template>
            </div>
            <div class="col-md-3">
              <label class="form-label small text-muted mb-1">{{ t('admin.dashboard.status') }}</label>
              <select v-model="filterActive" class="form-select form-select-sm" @change="reload(1)">
                <option value="">{{ t('admin.common.allFeminine') }}</option>
                <option value="1">{{ t('admin.common.active') }}</option>
                <option value="0">{{ t('admin.common.inactive') }}</option>
              </select>
            </div>
            <div class="col-md-3">
              <button type="button" class="btn btn-sm btn-outline-primary" @click="reload(1)">
                <i class="bi bi-search me-1"></i>{{ t('admin.common.filter') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div v-if="cfg.loadingDestinations && cfg.destinations.length === 0" class="card-body text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>{{ t('admin.countries.country') }}</th>
                <th>{{ t('admin.destinations.city') }}</th>
                <th>{{ t('admin.destinations.continent') }}</th>
                <th>{{ t('admin.destinations.flagEmoji') }}</th>
                <th>{{ t('admin.products.currency') }}</th>
                <th>{{ t('admin.shipments.mode') }}</th>
                <th>{{ t('admin.destinations.statusCol') }}</th>
                <th class="text-end">{{ t('admin.common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="cfg.destinations.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">{{ t('admin.destinations.noDestinations') }}</td>
              </tr>
              <tr v-for="d in cfg.destinations" :key="d.id">
                <td class="fw-medium">{{ d.country || '—' }}</td>
                <td>{{ d.city || '—' }}</td>
                <td>{{ d.continent || '—' }}</td>
                <td>
                  <CountryFlag
                    :iso="countriesStore.iso3166FromCountryField(d.country)"
                    :emoji="d.flag"
                    :label="d.country || ''"
                    size="1.35rem"
                  />
                </td>
                <td>
                  <span class="small fw-medium">{{ d.currency_code || '—' }}</span>
                  <span v-if="!d.currency_code" class="text-muted small d-block">{{ t('admin.destinations.fcfaDefault') }}</span>
                </td>
                <td>
                  <span class="badge bg-secondary-subtle text-secondary">{{ t('admin.destinations.ratesCount', { n: (d.shipping_modes || []).length }) }}</span>
                </td>
                <td>
                  <span :class="['badge', d.is_active ? 'bg-success' : 'bg-secondary']">
                    {{ d.is_active ? t('admin.common.active') : t('admin.common.inactive') }}
                  </span>
                </td>
                <td class="text-end">
                  <button v-can="['update', 'destinations']" type="button" class="btn btn-sm btn-outline-primary me-1" :title="t('admin.common.edit')" @click="openModal(d)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button v-can="['delete', 'destinations']" type="button" class="btn btn-sm btn-outline-danger" :title="t('admin.common.delete')" @click="onDelete(d)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card-footer bg-transparent py-3">
          <AdminPagination
            v-model:current-page="cfg.destinationsMeta.currentPage"
            v-model:limit="cfg.destinationsMeta.perPage"
            :total-items="cfg.destinationsMeta.total"
            @update:current-page="(p: number) => reload(p)"
            @update:limit="(l: number) => reload(1, l)"
          />
        </div>
      </div>
    </div>

    <!-- Onglet : pays + textes vitrine -->
    <div v-show="activeTab === 'vitrine'" class="vitrine-panel card border-0 shadow-sm overflow-hidden">
      <div class="row g-0">
        <div class="col-lg-4 col-xl-3 border-end bg-light">
          <div class="p-3 border-bottom bg-light sticky-top z-1">
            <label class="form-label small text-muted mb-1">{{ t('admin.destinations.countryListLabel') }}</label>
            <input
              v-model="countrySidebarSearch"
              type="search"
              class="form-control form-control-sm"
              :placeholder="t('admin.common.searchEllipsis')"
              autocomplete="off"
            />
            <p class="small text-muted mb-0 mt-2">
              {{ t('admin.destinations.countrySidebarHint') }}
            </p>
          </div>
          <div class="country-sidebar-list">
            <div
              v-for="c in filteredCountriesSidebar"
              :key="c.uuid"
              class="d-flex align-items-center justify-content-between gap-2 px-3 py-2 border-bottom"
            >
              <div class="d-flex align-items-center gap-2 min-w-0">
                <CountryFlag :iso="c.code" :emoji="c.flag_emoji || null" :label="countryLabel(c)" size="1.25rem" />
                <span class="small text-truncate">{{ countryLabel(c) }}</span>
              </div>
              <div class="form-check form-switch m-0 flex-shrink-0">
                <input
                  :id="`country-on-${c.uuid}`"
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                  :checked="isCountryActive(c)"
                  :disabled="togglingCountryUuid === c.uuid || !canToggleCountry"
                  :title="isCountryActive(c) ? t('admin.destinations.activeOnSite') : t('admin.destinations.inactiveOnSite')"
                  @change="toggleCountryStatus(c)"
                >
              </div>
            </div>
            <div v-if="filteredCountriesSidebar.length === 0" class="p-4 text-center text-muted small">
              {{ t('admin.destinations.noCountryMatch') }}
            </div>
          </div>
        </div>
        <div class="col-lg-8 col-xl-9 p-4">
          <h5 class="mb-3">{{ t('admin.destinations.textsSectionPublic') }}</h5>
          <p class="text-muted small mb-4">
            {{ t('admin.destinations.textsSectionHint') }}
          </p>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">{{ t('admin.destinations.titleFr') }}</label>
              <input v-model="destText.heading_fr" type="text" class="form-control" :disabled="!canEditDestTexts" maxlength="255">
            </div>
            <div class="col-md-6">
              <label class="form-label">{{ t('admin.destinations.titleEn') }}</label>
              <input v-model="destText.heading_en" type="text" class="form-control" :disabled="!canEditDestTexts" maxlength="255">
            </div>
            <div class="col-md-6">
              <label class="form-label">{{ t('admin.destinations.subtitleFr') }}</label>
              <input v-model="destText.subtitle_fr" type="text" class="form-control" :disabled="!canEditDestTexts" maxlength="255">
            </div>
            <div class="col-md-6">
              <label class="form-label">{{ t('admin.destinations.subtitleEn') }}</label>
              <input v-model="destText.subtitle_en" type="text" class="form-control" :disabled="!canEditDestTexts" maxlength="255">
            </div>
            <div class="col-md-6">
              <label class="form-label">标题 (中文)</label>
              <input v-model="destText.heading_zh" type="text" class="form-control" :disabled="!canEditDestTexts" maxlength="255">
            </div>
            <div class="col-md-6">
              <label class="form-label">副标题 (中文)</label>
              <input v-model="destText.subtitle_zh" type="text" class="form-control" :disabled="!canEditDestTexts" maxlength="255">
            </div>
          </div>
          <div class="mt-4 d-flex align-items-center gap-2 flex-wrap">
            <button
              type="button"
              class="btn btn-primary"
              :disabled="savingDestText || !canEditDestTexts || !destSettingsReady"
              @click="saveDestTexts"
            >
              <span v-if="savingDestText" class="spinner-border spinner-border-sm me-2"></span>
              {{ t('admin.destinations.saveTexts') }}
            </button>
            <span v-if="!canEditDestTexts" class="small text-warning">{{ t('admin.destinations.settingsRequiredHint', { module: t('admin.settings.title') }) }}</span>
            <span v-else-if="!destSettingsReady" class="small text-muted">{{ t('admin.destinations.settingsMissingHint') }}</span>
          </div>
        </div>
      </div>
    </div>

    <div id="destModal" ref="modalRef" class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editing ? t('admin.destinations.modalEdit') : t('admin.destinations.modalNew') }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" :aria-label="t('admin.common.close')"></button>
          </div>
          <form @submit.prevent="save">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label d-flex align-items-center gap-2">
                    {{ t('admin.countries.country') }} *
                    <span v-if="countriesStore.loading" class="spinner-border spinner-border-sm text-primary" style="width: .85rem; height: .85rem;" role="status" aria-hidden="true"></span>
                  </label>
                  <template v-if="canListCountries">
                    <select
                      v-model="form.country_uuid"
                      class="form-select"
                      :required="!editing"
                      :disabled="countriesStore.loading"
                      @change="onCountryPick"
                    >
                      <option value="">
                        {{ countriesStore.loading ? t('admin.destinations.loadingCountriesEllipsis') : (editing ? t('admin.destinations.keepOrChangeCountry') : t('admin.destinations.chooseCountryDash')) }}
                      </option>
                      <option v-for="c in allCountriesSorted" :key="c.uuid" :value="c.uuid">
                        {{ (c.flag_emoji ? `${c.flag_emoji} ` : '') + countryLabel(c) }}
                      </option>
                    </select>
                    <small class="text-muted">{{ t('admin.destinations.officialCountriesHint') }}</small>
                  </template>
                  <template v-else>
                    <input v-model="form.country" type="text" class="form-control" required :placeholder="t('admin.destinations.manualCountryPlaceholder')">
                    <small class="text-warning">{{ t('admin.destinations.noCountriesListAccess') }}</small>
                  </template>
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ t('admin.destinations.city') }}</label>
                  <input v-model="form.city" type="text" class="form-control" placeholder="Ex: Douala">
                  <small v-if="cityOptions.length" class="text-muted">{{ t('admin.destinations.cityRefHint', { hint: cityHint }) }}</small>
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ t('admin.destinations.continent') }}</label>
                  <input v-model="form.continent" type="text" class="form-control" placeholder="Afrique, Europe...">
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ t('admin.destinations.flagEmoji') }}</label>
                  <input v-model="form.flag" type="text" class="form-control" maxlength="10" placeholder="🇨🇲">
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ t('admin.destinations.currencyIso') }}</label>
                  <select v-model="form.currency_code" class="form-select">
                    <option value="">{{ t('admin.destinations.fcfaDefault') }}</option>
                    <option v-for="opt in currencyChoices" :key="opt.code" :value="opt.code">{{ opt.code }} — {{ opt.label }}</option>
                  </select>
                  <small v-if="lockedCurrencyCode" class="text-muted">Devise du pays : {{ lockedCurrencyCode }} — modifiable au besoin.</small>
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ t('admin.destinations.statusCol') }}</label>
                  <select v-model="form.is_active" class="form-select">
                    <option :value="true">{{ t('admin.destinations.activeFeminine') }}</option>
                    <option :value="false">{{ t('admin.destinations.inactiveFeminine') }}</option>
                  </select>
                </div>
              </div>
              <p class="small text-muted mb-0 mt-3">
                {{ t('admin.destinations.modalFooterHint') }}
              </p>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useShippingConfigStore } from '~/stores/shippingConfig'
import { useCountriesStore, type Country } from '~/stores/countries'
import { useGlobalSettingsStore } from '~/stores/globalSettings'
import { useNotification } from '~/composables/useNotification'
import { useApi } from '~/composables/useApi'
import { useAbility } from '@casl/vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

const cfg = useShippingConfigStore()
const countriesStore = useCountriesStore()
const settingsStore = useGlobalSettingsStore()
const api = useApi()
const { t, locale } = useI18n()
const { success, error: notifyError } = useNotification()

const activeTab = ref<'freight' | 'vitrine'>('freight')
const countrySidebarSearch = ref('')
const togglingCountryUuid = ref<string | null>(null)
const savingDestText = ref(false)

const ability = useAbility()
/** Aligné sur les menus RBAC : paramètres globaux (textes), destinations (interrupteur pays) */
const canEditDestTexts = computed(() => ability.can('update', 'global-settings'))
const canToggleCountry = computed(() => ability.can('update', 'destinations'))

const DEST_TEXT_SLUGS = [
  { key: 'heading_fr' as const, slug: 'import_export_dest_heading_fr' },
  { key: 'heading_en' as const, slug: 'import_export_dest_heading_en' },
  { key: 'heading_zh' as const, slug: 'import_export_dest_heading_zh' },
  { key: 'subtitle_fr' as const, slug: 'import_export_dest_subtitle_fr' },
  { key: 'subtitle_en' as const, slug: 'import_export_dest_subtitle_en' },
  { key: 'subtitle_zh' as const, slug: 'import_export_dest_subtitle_zh' },
]

const destText = reactive({
  heading_fr: '',
  heading_en: '',
  heading_zh: '',
  subtitle_fr: '',
  subtitle_en: '',
  subtitle_zh: '',
})

const destUuids: Record<string, string> = {}

const destSettingsReady = computed(() =>
  DEST_TEXT_SLUGS.every(({ key }) => Boolean(destUuids[key]))
)

const hydrateDestTexts = () => {
  for (const { key, slug } of DEST_TEXT_SLUGS) {
    const item = settingsStore.items.find(i => i.slug === slug)
    if (item?.uuid) {
      destUuids[key] = item.uuid
      destText[key] = (item.vvalue as string) || ''
    }
  }
}

const saveDestTexts = async () => {
  if (!canEditDestTexts.value || !destSettingsReady.value) return
  savingDestText.value = true
  try {
    await Promise.all(
      DEST_TEXT_SLUGS.map(({ key }) => {
        const uuid = destUuids[key]
        if (!uuid) throw new Error('UUID manquant pour un texte.')
        return settingsStore.update(uuid, { vvalue: destText[key] })
      })
    )
    success(t('admin.destinations.textsSaved'))
  } catch (e: any) {
    notifyError(e.message || t('admin.messages.saveError'))
  } finally {
    savingDestText.value = false
  }
}

const currencyChoices = [
  { code: 'XAF', label: 'CFA CEMAC (Cameroun, Gabon…)' },
  { code: 'XOF', label: 'CFA UEMOA (CI, Sénégal…)' },
  { code: 'EUR', label: 'Euro' },
  { code: 'USD', label: 'Dollar US' },
  { code: 'GBP', label: 'Livre sterling' },
  { code: 'CNY', label: 'Yuan chinois' },
  { code: 'MAD', label: 'Dirham marocain' },
  { code: 'NGN', label: 'Naira nigérian' },
  { code: 'GHS', label: 'Cedi ghanéen' },
  { code: 'ZAR', label: 'Rand sud-africain' },
]

const allCountriesSorted = computed(() => {
  const list = [...countriesStore.countries]
  const loc = locale.value === 'en' ? 'en' : 'fr'
  return list.sort((a, b) =>
    countryLabel(a).localeCompare(countryLabel(b), loc)
  )
})

const filteredCountriesSidebar = computed(() => {
  const q = countrySidebarSearch.value.trim().toLowerCase()
  if (!q) return allCountriesSorted.value
  return allCountriesSorted.value.filter((c) => {
    const name = countryLabel(c).toLowerCase()
    return name.includes(q) || (c.code || '').toLowerCase().includes(q)
  })
})

const canListCountries = computed(() => allCountriesSorted.value.length > 0)

const countryLabel = (c: Country) => {
  if (locale.value === 'zh') return c.name_zh || c.name_en || c.name_fr || c.label || c.code
  if (locale.value === 'en') return c.name_en || c.label || c.code
  return c.name_fr || c.label || c.code
}

function isCountryActive(c: Country) {
  const s = c.status as any
  return s == null || s === 1 || s === '1' || Number(s) === 1
}

const toggleCountryStatus = async (c: Country) => {
  if (!c.uuid || !canToggleCountry.value) return
  const next = isCountryActive(c) ? 0 : 1
  togglingCountryUuid.value = c.uuid
  try {
    const res = await api.post(`/country/${c.uuid}`, { status: next })
    if (!res.success) throw new Error(res.message || t('admin.messages.genericError'))
    await countriesStore.fetchAll(true)
    success(t('admin.messages.statusUpdated'))
  } catch (e: any) {
    notifyError(e.message || t('admin.countries.updateFailed'))
  } finally {
    togglingCountryUuid.value = null
  }
}

/** Nom stocké en base destination (= libellé métier, aligné sur le pays) */
function destinationCountryName(c: Country) {
  return countryLabel(c)
}

const filterCountryUuid = ref('')
const filterActive = ref<string>('')

const filterCountryForApi = computed(() => {
  if (!filterCountryUuid.value) return null
  const c = allCountriesSorted.value.find(x => x.uuid === filterCountryUuid.value)
  return c ? destinationCountryName(c) : null
})

const cityHint = computed(() =>
  cityOptions.value.length ? cityOptions.value.slice(0, 12).map(c => c.label).join(', ') + (cityOptions.value.length > 12 ? '…' : '') : ''
)

const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null
const editing = ref<{ id: string } | null>(null)
const saving = ref(false)

const cityOptions = ref<{ uuid: string; label: string }[]>([])
const lockedCurrencyCode = ref('')

const form = reactive({
  country_uuid: '',
  country: '',
  city: '',
  continent: '',
  flag: '',
  currency_code: '' as string,
  is_active: true as boolean,
})

const reload = async (page = cfg.destinationsMeta.currentPage, limit = cfg.destinationsMeta.perPage) => {
  const opts: Parameters<typeof cfg.fetchDestinations>[0] = {
    page,
    limit,
    country: filterCountryForApi.value?.trim() || null,
  }
  if (filterActive.value !== '') opts.is_active = filterActive.value === '1'
  await cfg.fetchDestinations(opts)
}

const resetForm = () => {
  form.country_uuid = ''
  form.country = ''
  form.city = ''
  form.continent = ''
  form.flag = ''
  form.currency_code = ''
  form.is_active = true
  cityOptions.value = []
  lockedCurrencyCode.value = ''
}

function applyCountryFields(c: Country) {
  form.country = destinationCountryName(c)
  form.continent = (c.continent || '').trim()
  form.flag = (c.flag_emoji || '').trim()
  const cc = (c.currency_code || '').trim().toUpperCase()
  lockedCurrencyCode.value = cc
  form.currency_code = cc || ''
}

const onCountryPick = async () => {
  const uuid = form.country_uuid
  if (!uuid) return
  const c = allCountriesSorted.value.find(x => x.uuid === uuid)
  if (!c) return
  applyCountryFields(c)
  cityOptions.value = []
  if (canListCountries.value) {
    const cities = await countriesStore.fetchCities(uuid)
    cityOptions.value = (cities || []).map(ct => ({ uuid: ct.uuid, label: ct.label }))
  }
}

function resolveCountryUuidFromDestinationCountry(name: string): string {
  const n = (name || '').trim().toLowerCase()
  if (!n) return ''
  const hit = allCountriesSorted.value.find(
    c =>
      (c.name_fr && c.name_fr.toLowerCase() === n) ||
      (c.name_en && c.name_en.toLowerCase() === n) ||
      (c.label && c.label.toLowerCase() === n)
  )
  return hit?.uuid || ''
}

const openModal = async (row?: any) => {
  if (row?.id) {
    editing.value = { id: row.id }
    form.country = row.country || ''
    form.city = row.city || ''
    form.continent = row.continent || ''
    form.flag = row.flag || ''
    form.currency_code = row.currency_code ? String(row.currency_code).toUpperCase() : ''
    form.is_active = Boolean(row.is_active)
    if (canListCountries.value) {
      form.country_uuid = resolveCountryUuidFromDestinationCountry(row.country || '')
      lockedCurrencyCode.value = form.currency_code
      if (form.country_uuid) {
        await countriesStore.fetchCities(form.country_uuid)
        cityOptions.value = (countriesStore.citiesByCountry[form.country_uuid] || []).map(ct => ({
          uuid: ct.uuid,
          label: ct.label,
        }))
      } else {
        cityOptions.value = []
      }
    } else {
      form.country_uuid = ''
      cityOptions.value = []
    }
  } else {
    editing.value = null
    resetForm()
  }
  modalInstance?.show()
}

const save = async () => {
  if (canListCountries.value && !editing.value && !form.country_uuid) {
    notifyError(t('admin.destinations.selectCountryList'))
    return
  }
  saving.value = true
  try {
    const payload = {
      country: form.country.trim() || null,
      city: form.city.trim() || null,
      continent: form.continent.trim() || null,
      flag: form.flag.trim() || null,
      currency_code: form.currency_code.trim() ? form.currency_code.trim().toUpperCase() : null,
      is_active: form.is_active,
    }
    if (editing.value) {
      await cfg.updateDestination(editing.value.id, payload)
      success(t('admin.destinations.updated'))
    } else {
      await cfg.createDestination(payload)
      success(t('admin.destinations.created'))
    }
    modalInstance?.hide()
    await reload(1)
  } catch (e: any) {
    notifyError(e.message || t('admin.messages.genericError'))
  } finally {
    saving.value = false
  }
}

const onDelete = async (d: any) => {
  if (!await useSwal().confirmDelete(t('admin.confirm.deleteDestinationModes', { name: d.country || String(d.id) }))) return
  try {
    await cfg.deleteDestination(d.id)
    success(t('admin.destinations.deleted'))
    await reload()
  } catch (e: any) {
    notifyError(e.message || t('admin.messages.genericError'))
  }
}

onMounted(async () => {
  await Promise.all([
    countriesStore.fetchAll(),
    settingsStore.fetchAll(),
  ])
  hydrateDestTexts()
  await reload(1)
  if (typeof window !== 'undefined' && (window as any).bootstrap && modalRef.value) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})
</script>

<style scoped>
.country-sidebar-list {
  max-height: min(70vh, 640px);
  overflow-y: auto;
}
</style>

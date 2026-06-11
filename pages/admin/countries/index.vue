<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">{{ t('admin.countries.title') }}</h4>
        <p class="text-muted mb-0">
          {{ meta.total }} pays — codes ISO, indicatif téléphonique, devise (catégorie DVS), ordre d'affichage
        </p>
      </div>
      <button v-can="['create', 'countries']" type="button" class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>{{ t('admin.countries.newCountry') }}
      </button>
    </div>

    <div class="card border-0 shadow-sm mb-3">
      <div class="card-body py-3">
        <div class="row g-2 align-items-center">
          <div class="col-md-4">
            <label class="form-label small text-muted mb-1">{{ t('admin.categories.linesPerPage') }}</label>
            <select
              :value="meta.perPage"
              class="form-select form-select-sm"
              @change="(e) => fetchList(1, Number((e.target as HTMLSelectElement).value))"
            >
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
          <div class="col-md-8 text-md-end small text-muted">
            {{ t('admin.pagination.pageOf', { current: meta.currentPage, last: meta.lastPage }) }}
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>{{ t('admin.countries.country') }}</th>
              <th>{{ t('admin.countries.countryCode') }}</th>
              <th>{{ t('admin.countries.dialCode') }}</th>
              <th>{{ t('admin.products.currency') }}</th>
              <th class="text-center">{{ t('admin.countries.displayOrder') }}</th>
              <th>{{ t('admin.dashboard.status') }}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-4 text-muted">
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ t('admin.common.loading') }}
              </td>
            </tr>
            <tr v-else-if="rows.length === 0">
              <td colspan="7" class="text-center py-4 text-muted">{{ t('admin.countries.noCountries') }}</td>
            </tr>
            <tr v-for="row in rows" :key="row.uuid">
              <td>
                <span class="fw-medium">{{ row.label }}</span>
                <span v-if="row.name_fr && row.name_fr !== row.label" class="d-block small text-muted">{{ row.name_fr }}</span>
              </td>
              <td><code>{{ row.code }}</code></td>
              <td>{{ row.phone_code || '—' }}</td>
              <td>
                <span v-if="row.currency?.code || row.currency?.label" class="badge bg-secondary-subtle text-secondary">
                  {{ row.currency?.code || row.currency?.label }}
                </span>
                <span v-else-if="row.currency_code" class="badge bg-secondary-subtle text-secondary">{{ row.currency_code }}</span>
                <span v-else class="text-muted">—</span>
              </td>
              <td class="text-center">{{ row.sort_order ?? '—' }}</td>
              <td>
                <span :class="['badge', statusClass(row.status)]">{{ statusLabel(row.status) }}</span>
              </td>
              <td>
                <div class="d-flex gap-2">
                  <button
                    v-can="['update', 'countries']"
                    type="button"
                    class="btn btn-sm btn-outline-primary"
                    :title="t('admin.common.edit')"
                    @click="openModal(row)"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    v-can="['delete', 'countries']"
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    :title="t('admin.common.delete')"
                    @click="confirmDelete(row)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          v-model:current-page="meta.currentPage"
          v-model:limit="meta.perPage"
          :total-items="meta.total"
          @update:current-page="(p: number) => fetchList(p)"
          @update:limit="(l: number) => fetchList(1, l)"
        />
      </div>
    </div>

    <div id="countryModal" class="modal fade" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editing ? t('admin.countries.modalEdit') : t('admin.countries.modalNew') }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="save">
            <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
              <div class="row g-3">
                <div class="col-md-8">
                  <label class="form-label">{{ t('admin.countries.countryLabel') }} *</label>
                  <input v-model="form.label" type="text" class="form-control" required maxlength="255" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Code pays * <span class="text-muted small">(ISO, ex. ci, fr)</span></label>
                  <input
                    v-model="form.code"
                    type="text"
                    class="form-control"
                    required
                    maxlength="255"
                    :disabled="!!editing"
                    pattern="[A-Za-z]{2,3}"
                    title="2 ou 3 lettres"
                    @blur="form.code = (form.code || '').toLowerCase()"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Indicatif téléphonique</label>
                  <input v-model="form.phone_code" type="text" class="form-control" maxlength="10" placeholder="+225" />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Devise (réf. catégories DVS)</label>
                  <select v-model="form.currency_uuid" class="form-select">
                    <option value="">— Non renseignée —</option>
                    <option v-for="c in currencyOptions" :key="c.uuid" :value="c.uuid">
                      {{ categoryLabel(c) }} ({{ c.code }})
                    </option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Ordre d'affichage *</label>
                  <input v-model.number="form.sort_order" type="number" min="0" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ t('admin.dashboard.status') }}</label>
                  <select v-model.number="form.status" class="form-select">
                    <option :value="1">Actif</option>
                    <option :value="2">Inactif</option>
                    <option :value="0">Archivé</option>
                  </select>
                </div>
              </div>

              <ul class="nav nav-tabs mb-3 mt-2">
                <li class="nav-item">
                  <button type="button" class="nav-link active" data-bs-toggle="tab" data-bs-target="#country-name-fr">{{ t('admin.common.french') }}</button>
                </li>
                <li class="nav-item">
                  <button type="button" class="nav-link" data-bs-toggle="tab" data-bs-target="#country-name-en">{{ t('admin.common.english') }}</button>
                </li>
                <li class="nav-item">
                  <button type="button" class="nav-link" data-bs-toggle="tab" data-bs-target="#country-name-zh">{{ t('admin.common.chinese') }}</button>
                </li>
              </ul>
              <div class="tab-content">
                <div id="country-name-fr" class="tab-pane fade show active">
                  <label class="form-label">Nom affiché (FR)</label>
                  <input v-model="form.name_fr" type="text" class="form-control" maxlength="150" />
                </div>
                <div id="country-name-en" class="tab-pane fade">
                  <label class="form-label">Display name (EN)</label>
                  <input v-model="form.name_en" type="text" class="form-control" maxlength="150" />
                </div>
                <div id="country-name-zh" class="tab-pane fade">
                  <label class="form-label">显示名称 (中文)</label>
                  <input v-model="form.name_zh" type="text" class="form-control" maxlength="150" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" :disabled="saving">{{ t('admin.common.cancel') }}</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ saving ? t('admin.common.savingEllipsis') : t('admin.common.save') }}
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
const { categoryLabel } = useCategoryLabel()

import { computed, reactive, ref, onMounted } from 'vue'
import { usePersonalShoppingStore } from '~/stores/personalShopping'
import { useNotification } from '~/composables/useNotification'
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'admin'
})

interface Meta {
  total: number
  currentPage: number
  perPage: number
  lastPage: number
}

interface CountryRow {
  uuid: string
  label: string
  code: string
  phone_code?: string | null
  sort_order?: number | null
  status?: number | null
  name_fr?: string | null
  name_en?: string | null
  name_zh?: string | null
  currency_code?: string | null
  currency?: { uuid?: string; label?: string; code?: string } | null
}

function applyPaginator(res: any, items: CountryRow[], meta: Meta) {
  const d = res.data
  if (d && typeof d === 'object' && Array.isArray(d.data)) {
    items.splice(0, items.length, ...d.data)
    meta.total = d.total ?? d.data.length
    meta.currentPage = d.current_page ?? meta.currentPage
    meta.perPage = d.per_page ?? meta.perPage
    meta.lastPage = d.last_page ?? 1
  } else if (Array.isArray(d)) {
    items.splice(0, items.length, ...d)
    meta.total = d.length
    meta.currentPage = 1
    meta.lastPage = 1
  } else {
    items.splice(0, items.length)
    meta.total = 0
    meta.lastPage = 1
  }
}

const psStore = usePersonalShoppingStore()
const { success, error } = useNotification()
const api = useApi()

const rows = ref<CountryRow[]>([])
const meta = reactive<Meta>({ total: 0, currentPage: 1, perPage: 15, lastPage: 1 })
const loading = ref(false)
const saving = ref(false)

const editing = ref<CountryRow | null>(null)
const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null

const form = reactive({
  label: '',
  name_fr: '',
  name_en: '',
  name_zh: '',
  code: '',
  phone_code: '',
  currency_uuid: '',
  sort_order: 0,
  status: 1
})

const currencyOptions = computed(() => {
  const list = (psStore.categories || [])
    .filter((c: any) => {
      const s = (c.slug || '').toString().toUpperCase()
      return s === 'DVS' || s.startsWith('DVS-') || s.startsWith('DVS_')
    })
    .map((c: any) => ({
      uuid: c.uuid as string,
      code: ((c.code || c.label || '') as string).toString().toUpperCase(),
      label: categoryLabel(c) as string
    }))
    .filter((c: any) => c.uuid)
  return list
})

const statusLabel = (s: number | null | undefined) => {
  const n = s ?? 1
  if (n === 0) return 'Archivé'
  if (n === 2) return 'Inactif'
  return 'Actif'
}

const statusClass = (s: number | null | undefined) => {
  const n = s ?? 1
  if (n === 0) return 'bg-secondary'
  if (n === 2) return 'bg-warning text-dark'
  return 'bg-success'
}

const fetchList = async (page?: number, limit?: number) => {
  loading.value = true
  try {
    const p = page ?? meta.currentPage
    const l = limit ?? meta.perPage
    const res = await api.post<any>('/country/all', { page: p, limit: l }, { query: { page: p, limit: l } })
    if (res.success) {
      applyPaginator(res, rows.value, meta)
    } else {
      error(res.message || t('admin.countries.loadFailed'))
    }
  } catch (e: any) {
    error(e.message || t('admin.countries.networkError'))
  } finally {
    loading.value = false
  }
}

const openModal = (row?: CountryRow) => {
  if (row) {
    editing.value = row
    form.label = row.label || ''
    form.name_fr = row.name_fr || row.label || ''
    form.name_en = row.name_en || ''
    form.name_zh = row.name_zh || ''
    form.code = row.code || ''
    form.phone_code = row.phone_code || ''
    form.currency_uuid = row.currency?.uuid || ''
    form.sort_order = typeof row.sort_order === 'number' ? row.sort_order : 0
    form.status = typeof row.status === 'number' ? row.status : 1
  } else {
    editing.value = null
    const nextOrder =
      rows.value.length > 0
        ? Math.max(...rows.value.map((r) => (typeof r.sort_order === 'number' ? r.sort_order : 0))) + 1
        : (meta.total || 0) + 1
    form.label = ''
    form.name_fr = ''
    form.name_en = ''
    form.name_zh = ''
    form.code = ''
    form.phone_code = ''
    form.currency_uuid = ''
    form.sort_order = nextOrder
    form.status = 1
  }
  modalInstance?.show()
}

const save = async () => {
  saving.value = true
  try {
    const code = (form.code || '').trim().toLowerCase()
    if (editing.value) {
      const payload: Record<string, any> = {
        label: form.label.trim(),
        name_fr: form.name_fr?.trim() || null,
        name_en: form.name_en?.trim() || null,
        name_zh: form.name_zh?.trim() || null,
        code,
        phone_code: form.phone_code?.trim() || null,
        sort_order: form.sort_order,
        status: form.status
      }
      if (form.currency_uuid) {
        payload.currency_uuid = form.currency_uuid
      }
      const res = await api.put<CountryRow>(`/country/${editing.value.uuid}`, payload)
      if (!res.success) {
        error(res.message || t('admin.countries.updateFailed'))
        return
      }
      success(t('admin.countries.updated'))
    } else {
      const payload: Record<string, any> = {
        label: form.label.trim(),
        name_fr: form.name_fr?.trim() || form.label.trim(),
        name_en: form.name_en?.trim() || null,
        name_zh: form.name_zh?.trim() || null,
        code,
        phone_code: form.phone_code?.trim() || null,
        sort_order: form.sort_order,
        status: form.status
      }
      if (form.currency_uuid) {
        payload.currency_uuid = form.currency_uuid
      }
      const res = await api.post<CountryRow>('/country', payload)
      if (!res.success) {
        error(res.message || t('admin.countries.createFailed'))
        return
      }
      success(t('admin.countries.created'))
    }
    modalInstance?.hide()
    await fetchList(meta.currentPage)
  } catch (e: any) {
    error(e.message || t('admin.messages.genericError'))
  } finally {
    saving.value = false
  }
}

const confirmDelete = (row: CountryRow) => {
  if (!row?.uuid) return
  if (!confirm(t('admin.confirm.deleteCountry', { name: row.label || row.code }))) return
  void doDelete(row.uuid)
}

const doDelete = async (uuid: string) => {
  try {
    const res = await api.delete(`/country/${uuid}`)
    if (!res.success) {
      error(res.message || 'Suppression impossible')
      return
    }
    success(t('admin.countries.deleted'))
    await fetchList(rows.value.length <= 1 && meta.currentPage > 1 ? meta.currentPage - 1 : meta.currentPage)
  } catch (e: any) {
    error(e.message || t('admin.messages.genericError'))
  }
}

onMounted(async () => {
  await psStore.fetchCategories()
  await fetchList(1)
  if (typeof window !== 'undefined' && (window as any).bootstrap && modalRef.value) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})
</script>

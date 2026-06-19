<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">{{ t('admin.visas.title') }}</h4>
        <p class="text-muted mb-0">{{ visasStore.visaTypesMeta.total }} types de visa configurés</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>Nouveau visa
      </button>
    </div>

    <!-- Visa Cards -->
    <div class="row g-4">
      <div v-for="visa in visaTypes" :key="visa.id" class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div class="visa-icon">
                <i class="bi bi-passport fs-4"></i>
              </div>
              <span :class="['badge', visa.is_active ? 'bg-success' : 'bg-secondary']">
                {{ visa.is_active ? 'Actif' : 'Inactif' }}
              </span>
            </div>
            <h5 class="card-title">{{ visa.name_fr }}</h5>
            <p class="text-muted small mb-3">{{ truncate(stripHtml(visa.description_fr || ''), 100) }}</p>

            <div class="row g-2 mb-3">
              <div class="col-6">
                <small class="text-muted d-block">Durée</small>
                <strong>{{ visa.duration_fr }}</strong>
              </div>
              <div class="col-6">
                <small class="text-muted d-block">Prix</small>
                <strong class="text-primary">{{ formatPrice(visa.cost, visa.currency) }}</strong>
              </div>
            </div>

            <div class="mb-3">
              <small class="text-muted d-block mb-1">Documents requis</small>
              <div class="d-flex flex-wrap gap-1">
                <span v-for="doc in (visa.requirements_fr || []).slice(0, 3)" :key="doc" class="badge bg-light text-dark small">
                  {{ doc }}
                </span>
                <span v-if="(visa.requirements_fr || []).length > 3" class="badge bg-light text-dark small">
                  +{{ visa.requirements_fr.length - 3 }}
                </span>
              </div>
            </div>

            <div v-if="visa.pdf_url" class="mb-3">
              <a :href="visa.pdf_url" target="_blank" class="btn btn-sm btn-outline-primary w-100">
                <i class="bi bi-file-earmark-pdf me-2"></i>Voir le formulaire PDF
              </a>
            </div>
          </div>
          <div class="card-footer bg-transparent border-0">
            <div class="d-flex w-100">
              <button class="btn btn-sm btn-outline-primary me-2" @click="openModal(visa)">
                <i class="bi bi-pencil me-1"></i>{{ t('admin.common.edit') }}
              </button>
              <button class="btn btn-sm btn-outline-danger" :disabled="deletingId === visa.id" @click="deleteVisa(visa.id)">
                <span v-if="deletingId === visa.id" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <i v-else class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="visaTypes.length === 0" class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center py-5">
            <i class="bi bi-passport display-4 text-muted"></i>
            <h5 class="mt-3">{{ t('admin.visas.noVisas') }}</h5>
            <p class="text-muted">Configurez les types de visas disponibles.</p>
            <button class="btn btn-primary" @click="openModal()">
              <i class="bi bi-plus-lg me-2"></i>Ajouter un visa
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="visaTypes.length > 0" class="card border-0 shadow-sm mt-4">
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          v-model:current-page="visasStore.visaTypesMeta.currentPage"
          v-model:limit="visasStore.visaTypesMeta.perPage"
          :total-items="visasStore.visaTypesMeta.total"
          @update:current-page="(p: number) => fetchVisaTypes(p)"
          @update:limit="(l: number) => fetchVisaTypes(1, l)"
        />
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="visaModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingVisa ? 'Modifier' : 'Nouveau' }} type de visa</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveVisa">
            <div class="modal-body">
              <!-- Tabs -->
              <ul class="nav nav-tabs mb-3">
                <li class="nav-item">
                  <button type="button" class="nav-link active" data-bs-toggle="tab" data-bs-target="#visa-fr">{{ t('admin.common.french') }}</button>
                </li>
                <li class="nav-item">
                  <button type="button" class="nav-link" data-bs-toggle="tab" data-bs-target="#visa-en">{{ t('admin.common.english') }}</button>
                </li>
                <li class="nav-item">
                  <button type="button" class="nav-link" data-bs-toggle="tab" data-bs-target="#visa-zh">{{ t('admin.common.chinese') }}</button>
                </li>
              </ul>

              <div class="tab-content mb-3">
                <div class="tab-pane fade show active" id="visa-fr">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label">Nom du visa (FR) *</label>
                      <input v-model="form.name_fr" type="text" class="form-control" required />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Durée</label>
                      <input v-model="form.duration_fr" type="text" class="form-control" placeholder="90 jours" />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Validité</label>
                      <input v-model="form.validity_fr" type="text" class="form-control" placeholder="1 an" />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Temps de traitement</label>
                      <input v-model="form.processing_time_fr" type="text" class="form-control" placeholder="5-7 jours ouvrés" />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Description (FR)</label>
                      <WysiwygEditor v-model="form.description_fr" height="160px" />
                    </div>
                  </div>
                </div>
                <div class="tab-pane fade" id="visa-en">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label">Visa Name (EN) *</label>
                      <input v-model="form.name_en" type="text" class="form-control" />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Duration</label>
                      <input v-model="form.duration_en" type="text" class="form-control" placeholder="90 days" />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Validity</label>
                      <input v-model="form.validity_en" type="text" class="form-control" placeholder="1 year" />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Processing Time</label>
                      <input v-model="form.processing_time_en" type="text" class="form-control" placeholder="5-7 working days" />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Description (EN)</label>
                      <WysiwygEditor v-model="form.description_en" height="160px" />
                    </div>
                  </div>
                </div>
                <div class="tab-pane fade" id="visa-zh">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label">签证名称 (中文)</label>
                      <input v-model="form.name_zh" type="text" class="form-control" />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">停留期限</label>
                      <input v-model="form.duration_zh" type="text" class="form-control" />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">有效期</label>
                      <input v-model="form.validity_zh" type="text" class="form-control" />
                    </div>
                    <div class="col-12">
                      <label class="form-label">办理时间</label>
                      <input v-model="form.processing_time_zh" type="text" class="form-control" />
                    </div>
                    <div class="col-12">
                      <label class="form-label">描述 (中文)</label>
                      <WysiwygEditor v-model="form.description_zh" height="160px" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Type de visa *</label>
                  <select v-model="form.type" class="form-select" required>
                    <option value="">Sélectionner</option>
                    <option value="touriste">Touriste</option>
                    <option value="affaires">Affaires</option>
                    <option value="transit">{{ t('admin.dashboard.transit') }}</option>
                    <option value="travail">Travail</option>
                    <option value="etudes">Études</option>
                    <option value="familial">Regroupement familial</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Prix</label>
                  <div class="input-group">
                    <input v-model.number="form.cost" type="number" class="form-control" min="0" placeholder="0" />
                    <select v-model="form.currency" class="form-select" style="max-width: 120px;">
                      <option v-for="c in currencyOptions" :key="c.code" :value="c.code">{{ c.label }}</option>
                    </select>
                  </div>
                </div>

                <div class="col-12">
                  <label class="form-label">Documents requis (séparés par virgule)</label>
                  <input v-model="form.requirementsInput" type="text" class="form-control" placeholder="Passeport, Photo, Formulaire, etc." />
                </div>

                <div class="col-12">
                  <label class="form-label">Formulaire PDF</label>
                  <div class="d-flex align-items-center gap-2">
                    <input
                      type="file"
                      class="form-control"
                      accept=".pdf,.doc,.docx"
                      :disabled="uploadingPdf"
                      @change="onVisaPdfSelected"
                    />
                    <a
                      v-if="form.pdf_url"
                      :href="resolveAsset(form.pdf_url)"
                      target="_blank"
                      class="btn btn-outline-primary"
                      title="Voir"
                    >
                      <i class="bi bi-eye"></i>
                    </a>
                  </div>
                  <small v-if="uploadingPdf" class="text-muted">Téléversement…</small>
                  <small v-else-if="form.pdf_url" class="text-muted text-truncate d-block">{{ form.pdf_url }}</small>
                </div>

                <div class="col-12">
                  <div class="form-check">
                    <input v-model="form.is_active" type="checkbox" class="form-check-input" id="visaActive" />
                    <label class="form-check-label" for="visaActive">
                      Visa actif
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ t('admin.common.cancel') }}</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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
import { useVisasStore } from '~/stores/visas'
import { useNotification } from '~/composables/useNotification'
import { getToken } from '~/composables/useApi'

definePageMeta({
  layout: 'admin'
})

const visasStore = useVisasStore()
const { success, error } = useNotification()
const config = useRuntimeConfig()

const uploadingPdf = ref(false)

const resolveAsset = (path: string) => {
  if (!path) return ''
  return resolveStorageAssetUrl(path)
}

const onVisaPdfSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploadingPdf.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'visas')
    const token = getToken()
    const res = await fetch((config.public.apiBase as string).replace(/\/$/, '') + '/upload/file', {
      method: 'POST',
      headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: fd,
    })
    const json = await res.json()
    if (json?.status === 'success' && (json.data?.url || json.data?.path)) {
      form.pdf_url = json.data.url || json.data.path
      success('Fichier téléversé')
    } else {
      throw new Error(json?.message || 'Échec du téléversement')
    }
  } catch (err: any) {
    error(err.message || 'Erreur de téléversement')
  } finally {
    uploadingPdf.value = false
    input.value = ''
  }
}

const visaTypes = computed(() => visasStore.visaTypes)

const editingVisa = ref<any>(null)
const saving = ref(false)
const deletingId = ref<number | string | null>(null)
const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null

const form = reactive({
  type: '',
  name_fr: '',
  name_en: '',
  name_zh: '',
  duration_fr: '',
  duration_en: '',
  duration_zh: '',
  validity_fr: '',
  validity_en: '',
  validity_zh: '',
  processing_time_fr: '',
  processing_time_en: '',
  processing_time_zh: '',
  cost: 0,
  currency: 'XOF',
  requirementsInput: '',
  description_fr: '',
  description_en: '',
  description_zh: '',
  pdf_url: '',
  is_active: true
})

const fetchVisaTypes = async (page?: number, limit?: number) => {
  await visasStore.fetchVisaTypes({
    page: page ?? visasStore.visaTypesMeta.currentPage,
    limit: limit ?? visasStore.visaTypesMeta.perPage
  })
}

onMounted(async () => {
  await fetchVisaTypes(1)
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const openModal = (visa?: any) => {
  if (visa) {
    editingVisa.value = visa
    form.type = visa.type || ''
    form.name_fr = visa.name_fr || ''
    form.name_en = visa.name_en || ''
    form.name_zh = visa.name_zh || ''
    form.duration_fr = visa.duration_fr || ''
    form.duration_en = visa.duration_en || ''
    form.duration_zh = visa.duration_zh || ''
    form.validity_fr = visa.validity_fr || ''
    form.validity_en = visa.validity_en || ''
    form.validity_zh = visa.validity_zh || ''
    form.processing_time_fr = visa.processing_time_fr || ''
    form.processing_time_en = visa.processing_time_en || ''
    form.processing_time_zh = visa.processing_time_zh || ''
    form.cost = visa.cost || 0
    form.currency = visa.currency || 'XOF'
    form.requirementsInput = (visa.requirements_fr || []).join(', ')
    form.description_fr = visa.description_fr || ''
    form.description_en = visa.description_en || ''
    form.description_zh = visa.description_zh || ''
    form.pdf_url = visa.pdf_url || ''
    form.is_active = visa.is_active ?? true
  } else {
    editingVisa.value = null
    form.type = ''
    form.name_fr = ''
    form.name_en = ''
    form.name_zh = ''
    form.duration_fr = ''
    form.duration_en = ''
    form.duration_zh = ''
    form.validity_fr = ''
    form.validity_en = ''
    form.validity_zh = ''
    form.processing_time_fr = ''
    form.processing_time_en = ''
    form.processing_time_zh = ''
    form.cost = 0
    form.currency = 'XOF'
    form.requirementsInput = ''
    form.description_fr = ''
    form.description_en = ''
    form.description_zh = ''
    form.pdf_url = ''
    form.is_active = true
  }
  modalInstance?.show()
}

const truncate = (str: string, len: number) => {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}

// Texte brut depuis le HTML de l'éditeur (pour l'aperçu des cartes).
const stripHtml = (html: string) =>
  String(html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

// Prix formaté avec sa devise (3 000 020 FCFA, 1 200 € …).
const formatPrice = (cost: any, currency?: string) => {
  const n = Number(cost) || 0
  const cur = (currency || 'XOF').toUpperCase()
  const symbol = cur === 'XOF' ? 'FCFA' : cur
  return `${n.toLocaleString('fr-FR')} ${symbol}`
}

const parseRequirements = (input: string): string[] => {
  return input.split(',').map(s => s.trim()).filter(s => s)
}

// Devises proposées dans le formulaire (select à côté du prix).
const currencyOptions = [
  { code: 'XOF', label: 'FCFA' },
  { code: 'EUR', label: 'EUR' },
  { code: 'USD', label: 'USD' },
  { code: 'CNY', label: 'CNY (¥)' },
]

const saveVisa = async () => {
  if (saving.value) return
  saving.value = true
  const data = {
    type: form.type,
    name_fr: form.name_fr,
    name_en: form.name_en || null,
    name_zh: form.name_zh || null,
    duration_fr: form.duration_fr || null,
    duration_en: form.duration_en || null,
    duration_zh: form.duration_zh || null,
    validity_fr: form.validity_fr || null,
    validity_en: form.validity_en || null,
    validity_zh: form.validity_zh || null,
    processing_time_fr: form.processing_time_fr || null,
    processing_time_en: form.processing_time_en || null,
    processing_time_zh: form.processing_time_zh || null,
    cost: form.cost,
    currency: form.currency || 'XOF',
    requirements_fr: parseRequirements(form.requirementsInput),
    requirements_en: parseRequirements(form.requirementsInput),
    requirements_zh: parseRequirements(form.requirementsInput),
    description_fr: form.description_fr || null,
    description_en: form.description_en || null,
    description_zh: form.description_zh || null,
    pdf_url: form.pdf_url || null,
    is_active: form.is_active
  }

  try {
    if (editingVisa.value) {
      await visasStore.updateVisaType(editingVisa.value.id, data as any)
      success('Visa modifié')
    } else {
      await visasStore.createVisaType(data as any)
      success('Visa créé')
    }
    modalInstance?.hide()
    await fetchVisaTypes(visasStore.visaTypesMeta.currentPage)
  } catch (err: any) {
    error(err.message || 'Erreur lors de l\'enregistrement')
  } finally {
    saving.value = false
  }
}

const deleteVisa = async (id: number) => {
  if (deletingId.value) return
  if (!await useSwal().confirmDelete(t('admin.confirm.deleteGuide'))) return
  deletingId.value = id
  try {
    await visasStore.deleteVisaType(id)
    success('Visa supprimé')
    await fetchVisaTypes(visasStore.visaTypesMeta.currentPage)
  } catch (err: any) {
    error(err.message || t('admin.messages.deleteError'))
  } finally {
    deletingId.value = null
  }
}
</script>
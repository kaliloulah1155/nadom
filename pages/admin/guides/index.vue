<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">{{ t('admin.guides.title') }}</h4>
        <p class="text-muted mb-0">{{ guidesStore.guidesMeta.total }} guides disponibles</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>Nouveau guide
      </button>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-transparent border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input v-model="filters.search" type="text" class="form-control border-start-0" placeholder="Rechercher un guide..." @input="debouncedFetch" />
            </div>
          </div>
          <div class="col-md-3">
            <select v-model="filterKind" class="form-select" @change="fetchGuides(1)">
              <option value="">{{ t('admin.guides.allTypes') }}</option>
              <option value="tour">Accompagnateurs</option>
              <option value="documentation">Documentation</option>
            </select>
          </div>
          <div class="col-md-3">
            <select v-model="filters.available" class="form-select" @change="fetchGuides(1)">
              <option :value="undefined">{{ t('admin.common.all') }}</option>
              <option :value="true">Disponibles</option>
              <option :value="false">Indisponibles</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Guides List -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Type</th>
                <th>Guide</th>
                <th>Langues</th>
                <th>villes</th>
                <th>Expérience</th>
                <th>Tarif/Jour</th>
                <th>Disponibilité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="guides.length === 0">
                <td colspan="8" class="text-center py-4 text-muted">
                  Aucun guide configuré
                </td>
              </tr>
              <tr v-for="guide in guides" :key="guide.id">
                <td>
                  <span class="badge" :class="guide.kind === 'documentation' ? 'bg-info text-dark' : 'bg-secondary'">
                    {{ guide.kind === 'documentation' ? 'Documentation' : 'Accompagnateur' }}
                  </span>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <img :src="resolveStorageAssetUrl(guide.avatar) || 'https://placehold.co/50x50?text=G'" class="rounded-circle me-3" width="45" height="45" style="object-fit: cover;" />
                    <div>
                      <div class="fw-medium">{{ guide.name }}</div>
                      <small class="text-muted">{{ guide.specializations_fr?.slice(0, 2).join(', ') }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span v-for="lang in guide.languages" :key="lang" class="badge bg-info me-1">{{ lang }}</span>
                </td>
                <td>
                  <span v-for="city in guide.cities" :key="city" class="badge bg-secondary me-1">{{ city }}</span>
                </td>
                <td>{{ guide.experience }} ans</td>
                <td class="fw-bold text-primary">{{ guide.price_per_day?.toLocaleString() }} {{ guide.currency || 'XOF' }}/j</td>
                <td>
                  <span :class="['badge', guide.available ? 'bg-success' : 'bg-secondary']">
                    {{ guide.available ? 'Disponible' : 'Indisponible' }}
                  </span>
                </td>
                <td>
                  <div class="d-flex">
                    <button class="btn btn-outline-primary btn-sm me-2" @click="openModal(guide)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" :disabled="deletingId === guide.id" @click="deleteGuide(guide.id)">
                      <span v-if="deletingId === guide.id" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <i v-else class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="guides.length > 0" class="card-footer bg-transparent py-3 border-top">
        <AdminPagination
          v-model:current-page="guidesStore.guidesMeta.currentPage"
          v-model:limit="guidesStore.guidesMeta.perPage"
          :total-items="guidesStore.guidesMeta.total"
          @update:current-page="(p: number) => fetchGuides(p)"
          @update:limit="(l: number) => fetchGuides(1, l)"
        />
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="guideModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingGuide ? 'Modifier' : 'Nouveau' }} guide</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveGuide">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Nom du guide *</label>
                  <input v-model="form.name" type="text" class="form-control" required />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Type</label>
                  <select v-model="form.kind" class="form-select">
                    <option value="tour">Accompagnateur (visites)</option>
                    <option value="documentation">Documentation / fichiers</option>
                  </select>
                </div>
                <div v-if="form.kind === 'documentation'" class="col-md-6">
                  <label class="form-label">Catégorie GDC *</label>
                  <select v-model.number="form.category_id" class="form-select">
                    <option :value="0">— Choisir —</option>
                    <option v-for="c in gdcCategories" :key="c.id" :value="c.id">{{ categoryLabel(c) }}</option>
                  </select>
                </div>
                <div v-if="form.kind === 'documentation'" class="col-12">
                  <label class="form-label">URL du document (PDF ou lien)</label>
                  <input v-model="form.document_url" type="url" class="form-control" placeholder="https://..." />
                </div>
                <div v-if="form.kind === 'documentation'" class="col-md-6">
                  <label class="form-label">Langues (affichage carte)</label>
                  <input v-model="form.languagesInput" type="text" class="form-control" placeholder="FR, EN" />
                </div>

                <template v-if="form.kind === 'tour'">
                  <div class="col-md-6">
                    <label class="form-label">Langues</label>
                    <input v-model="form.languagesInput" type="text" class="form-control" placeholder="Francais, English, Chinois (séparés par virgules)" />
                    <small class="text-muted">Entrez les langues séparées par des virgules</small>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Villes</label>
                    <input v-model="form.citiesInput" type="text" class="form-control" placeholder="Abidjan,广州, Shenzhen" />
                    <small class="text-muted">Entrez les villes séparées par des virgules</small>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Spécialisations (FR)</label>
                    <input v-model="form.specializations_frInput" type="text" class="form-control" placeholder="Achats, Sourcing, Contrôle qualité" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Spécialisations (EN)</label>
                    <input v-model="form.specializations_enInput" type="text" class="form-control" placeholder="Sourcing, Quality control, Procurement" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Spécialisations (中文)</label>
                    <input v-model="form.specializations_zhInput" type="text" class="form-control" placeholder="采购, 质检" />
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">Années d'expérience</label>
                    <input v-model.number="form.experience" type="number" class="form-control" min="0" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Devise</label>
                    <select v-model="form.currency" class="form-select">
                      <option value="XOF">FCFA (XOF)</option>
                      <option value="USD">Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="CNY">Yuan (CNY)</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Prix par jour ({{ form.currency }})</label>
                    <input v-model.number="form.price_per_day" type="number" class="form-control" min="0" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Prix par heure ({{ form.currency }})</label>
                    <input v-model.number="form.price_per_hour" type="number" class="form-control" min="0" />
                  </div>
                </template>

                <div class="col-12">
                  <label class="form-label">Avatar URL</label>
                  <div class="input-group">
                    <input v-model="form.avatar" type="text" class="form-control" placeholder="https://..." />
                    <button type="button" class="btn btn-outline-secondary" @click="form.avatar = `https://robohash.org/${form.name}?set=set5`">
                      <i class="bi bi-magic me-1"></i>Avatar
                    </button>
                  </div>
                </div>

                <div class="col-12">
                  <ul class="nav nav-tabs mb-2">
                    <li class="nav-item">
                      <button type="button" class="nav-link active" data-bs-toggle="tab" data-bs-target="#guide-desc-fr">{{ t('admin.common.french') }}</button>
                    </li>
                    <li class="nav-item">
                      <button type="button" class="nav-link" data-bs-toggle="tab" data-bs-target="#guide-desc-en">{{ t('admin.common.english') }}</button>
                    </li>
                    <li class="nav-item">
                      <button type="button" class="nav-link" data-bs-toggle="tab" data-bs-target="#guide-desc-zh">{{ t('admin.common.chinese') }}</button>
                    </li>
                  </ul>
                  <div class="tab-content">
                    <div class="tab-pane fade show active" id="guide-desc-fr">
                      <label class="form-label">Description (FR)</label>
                      <WysiwygEditor v-model="form.description_fr" height="160px" />
                    </div>
                    <div class="tab-pane fade" id="guide-desc-en">
                      <label class="form-label">Description (EN)</label>
                      <WysiwygEditor v-model="form.description_en" height="160px" />
                    </div>
                    <div class="tab-pane fade" id="guide-desc-zh">
                      <label class="form-label">描述 (中文)</label>
                      <WysiwygEditor v-model="form.description_zh" height="160px" />
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <div class="form-check">
                    <input v-model="form.available" type="checkbox" class="form-check-input" id="guideAvailable" />
                    <label class="form-check-label" for="guideAvailable">
                      Disponible pour les réservations
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
import { useGuidesStore } from '~/stores/guides'
import { useNotification } from '~/composables/useNotification'
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'admin'
})

const guidesStore = useGuidesStore()
const { success, error } = useNotification()
const { categoryLabel } = useCategoryLabel()
const api = useApi()

const guides = computed(() => guidesStore.guides)

const filters = reactive({
  search: '',
  available: undefined as boolean | undefined
})

const filterKind = ref('')
const gdcCategories = ref<any[]>([])

const editingGuide = ref<any>(null)
const saving = ref(false)
const deletingId = ref<string | null>(null)
const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null

const form = reactive({
  kind: 'tour' as 'tour' | 'documentation',
  category_id: 0,
  document_url: '',
  name: '',
  languagesInput: '',
  specializations_frInput: '',
  specializations_enInput: '',
  specializations_zhInput: '',
  citiesInput: '',
  experience: 0,
  avatar: '',
  currency: 'XOF',
  price_per_day: 0,
  price_per_hour: 0,
  description_fr: '',
  description_en: '',
  description_zh: '',
  available: true
})

const loadGdcCategories = async () => {
  const res = await api.get<any[]>(`/category/slug/GDC`)
  if (res.success && Array.isArray(res.data)) {
    gdcCategories.value = [...res.data].sort(
      (a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0)
    )
  }
}

const fetchGuides = async (page?: number, limit?: number) => {
  await guidesStore.fetchGuides({
    page: page ?? guidesStore.guidesMeta.currentPage,
    limit: limit ?? guidesStore.guidesMeta.perPage,
    available: filters.available,
    kind: filterKind.value || undefined
  })
}

let debounceTimer: any = null
const debouncedFetch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchGuides(1), 400)
}

onMounted(async () => {
  await loadGdcCategories()
  await fetchGuides(1)
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const openModal = (guide?: any) => {
  if (guide) {
    editingGuide.value = guide
    form.kind = guide.kind === 'documentation' ? 'documentation' : 'tour'
    form.category_id = guide.category_id || 0
    form.document_url = guide.document_url || ''
    form.name = guide.name || ''
    form.languagesInput = guide.languages?.join(', ') || ''
    form.specializations_frInput = guide.specializations_fr?.join(', ') || ''
    form.specializations_enInput = guide.specializations_en?.join(', ') || ''
    form.specializations_zhInput = guide.specializations_zh?.join(', ') || ''
    form.citiesInput = guide.cities?.join(', ') || ''
    form.experience = guide.experience || 0
    form.avatar = guide.avatar || ''
    form.currency = guide.currency || 'XOF'
    form.price_per_day = guide.price_per_day || 0
    form.price_per_hour = guide.price_per_hour || 0
    form.description_fr = guide.description_fr || ''
    form.description_en = guide.description_en || ''
    form.description_zh = guide.description_zh || ''
    form.available = guide.available ?? true
  } else {
    editingGuide.value = null
    form.kind = 'tour'
    form.category_id = 0
    form.document_url = ''
    form.name = ''
    form.languagesInput = ''
    form.specializations_frInput = ''
    form.specializations_enInput = ''
    form.specializations_zhInput = ''
    form.citiesInput = ''
    form.experience = 0
    form.avatar = ''
    form.currency = 'XOF'
    form.price_per_day = 0
    form.price_per_hour = 0
    form.description_fr = ''
    form.description_en = ''
    form.description_zh = ''
    form.available = true
  }
  modalInstance?.show()
}

const parseArrayInput = (input: string): string[] => {
  return input.split(',').map(s => s.trim()).filter(s => s)
}

const saveGuide = async () => {
  if (saving.value) return
  if (form.kind === 'documentation' && (!form.category_id || form.category_id === 0)) {
    error('Choisissez une catégorie GDC pour une fiche documentation.')
    return
  }
  saving.value = true

  const data: Record<string, any> = {
    kind: form.kind,
    category_id: form.kind === 'documentation' ? form.category_id : null,
    document_url: form.kind === 'documentation' ? form.document_url || null : null,
    name: form.name,
    languages: parseArrayInput(form.languagesInput),
    specializations_fr: parseArrayInput(form.specializations_frInput),
    specializations_en: parseArrayInput(form.specializations_enInput),
    specializations_zh: parseArrayInput(form.specializations_zhInput),
    cities: parseArrayInput(form.citiesInput),
    experience: form.experience,
    avatar: form.avatar || null,
    currency: form.currency,
    price_per_day: form.price_per_day,
    price_per_hour: form.price_per_hour,
    description_fr: form.description_fr || null,
    description_en: form.description_en || null,
    description_zh: form.description_zh || null,
    available: form.available
  }

  try {
    if (editingGuide.value) {
      await guidesStore.updateGuide(editingGuide.value.id, data as any)
      success('Guide modifié')
    } else {
      await guidesStore.createGuide(data as any)
      success('Guide créé')
    }
    modalInstance?.hide()
    await fetchGuides(guidesStore.guidesMeta.currentPage)
  } catch (err: any) {
    error(err.message || 'Erreur lors de l\'enregistrement')
  } finally {
    saving.value = false
  }
}

const deleteGuide = async (id: string) => {
  if (deletingId.value) return
  if (!await useSwal().confirmDelete(t('admin.confirm.deleteGuide'))) return
  deletingId.value = id
  try {
    await guidesStore.deleteGuide(id)
    success('Guide supprimé')
    await fetchGuides(guidesStore.guidesMeta.currentPage)
  } catch (err: any) {
    error(err.message || t('admin.messages.deleteError'))
  } finally {
    deletingId.value = null
  }
}
</script>
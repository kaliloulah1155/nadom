<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Gestion des guides</h4>
        <p class="text-muted mb-0">{{ guides.length }} guides disponibles</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>Nouveau guide
      </button>
    </div>

    <!-- Guides List -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Nom</th>
                <th>Categorie</th>
                <th>Description</th>
                <th>Fichier</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="guides.length === 0">
                <td colspan="6" class="text-center py-4 text-muted">
                  Aucun guide configure
                </td>
              </tr>
              <tr v-for="guide in paginatedGuides" :key="guide.id">
                <td>
                  <div class="d-flex align-items-center">
                    <div class="guide-icon me-3">
                      <i :class="[getCategoryIcon(guide.category), 'fs-4']"></i>
                    </div>
                    <div>
                      <div class="fw-medium">{{ guide.name_fr || (guide as any).name }}</div>
                      <small class="text-muted">{{ guide.language }}</small>
                    </div>
                  </div>
                </td>
                <td><span class="badge bg-secondary">{{ guide.category }}</span></td>
                <td><small v-html="truncate(guide.description_fr || (guide as any).description || '', 50)"></small></td>
                <td>
                  <a v-if="guide.fileUrl" :href="guide.fileUrl" target="_blank" class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-file-earmark-pdf me-1"></i>PDF
                  </a>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <span :class="['badge', guide.active ? 'bg-success' : 'bg-secondary']">
                    {{ guide.active ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td>
                  <div class="d-flex">
                    <button class="btn btn-outline-primary btn-sm me-2" @click="openModal(guide)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" @click="deleteGuide(guide.id)">
                      <i class="bi bi-trash"></i>
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
          v-model:current-page="currentPage"
          v-model:limit="perPage"
          :total-items="guides.length"
        />
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="guideModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingGuide ? 'Modifier' : 'Nouveau' }} guide</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveGuide">
            <div class="modal-body">
              <!-- Tabs for Bilingual Support -->
              <ul class="nav nav-tabs mb-3" id="guideLangTabs" role="tablist">
                <li class="nav-item" role="presentation">
                  <button class="nav-link active" id="guide-fr-tab" data-bs-toggle="tab" data-bs-target="#guide-fr-content" type="button" role="tab">Français</button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" id="guide-en-tab" data-bs-toggle="tab" data-bs-target="#guide-en-content" type="button" role="tab">English</button>
                </li>
              </ul>

              <div class="tab-content" id="guideLangTabsContent">
                <!-- French Tab -->
                <div class="tab-pane fade show active" id="guide-fr-content" role="tabpanel">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label">Nom du guide (FR) *</label>
                      <input v-model="form.name_fr" type="text" class="form-control" required />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Description (FR)</label>
                      <WysiwygEditor v-model="form.description_fr" height="150px" />
                    </div>
                  </div>
                </div>

                <!-- English Tab -->
                <div class="tab-pane fade" id="guide-en-content" role="tabpanel">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label">Guide Name (EN)</label>
                      <input v-model="form.name_en" type="text" class="form-control" placeholder="English name..." />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Description (EN)</label>
                      <WysiwygEditor v-model="form.description_en" height="150px" placeholder="English description..." />
                    </div>
                  </div>
                </div>
              </div>

              <hr class="my-4">

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Categorie *</label>
                  <select v-model="form.category" class="form-select" required>
                    <option value="">Selectionnez</option>
                    <option value="import">Import</option>
                    <option value="export">Export</option>
                    <option value="douane">Douane</option>
                    <option value="transport">Transport</option>
                    <option value="paiement">Paiement</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Langue d'origine</label>
                  <select v-model="form.language" class="form-select">
                    <option value="Francais">Francais</option>
                    <option value="English">English</option>
                    <option value="Chinois">Chinois</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label">Fichier PDF</label>
                  <input type="file" class="form-control" accept=".pdf" @change="handlePdfUpload" />
                  <small v-if="form.fileUrl" class="text-muted d-block mt-1">
                    <i class="bi bi-file-earmark-pdf me-1"></i>Fichier chargé
                  </small>
                </div>
                <div class="col-12">
                  <div class="form-check form-switch">
                    <input v-model="form.active" type="checkbox" class="form-check-input" id="guideActive" />
                    <label class="form-check-label" for="guideActive">Guide actif</label>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-md me-2" data-bs-dismiss="modal">Annuler</button>
              <button type="submit" class="btn btn-primary btn-md">
                <i class="bi bi-check-lg me-2"></i>Enregistrer
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
import { useFormatters } from '~/composables/useFormatters'
import { useNotification } from '~/composables/useNotification'
import WysiwygEditor from '~/components/admin/WysiwygEditor.vue'

definePageMeta({
  layout: 'admin'
})

const { truncate } = useFormatters()
const { success, error } = useNotification()

interface Guide {
  id: string
  name_fr: string
  name_en: string
  category: string
  description_fr: string
  description_en: string
  fileUrl: string
  language: string
  active: boolean

  // compatibility
  name?: string
  description?: string
}

const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null

const guides = ref<Guide[]>([])
const editingGuide = ref<Guide | null>(null)

const currentPage = ref(1)
const perPage = ref(10)

const paginatedGuides = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return guides.value.slice(start, start + perPage.value)
})

const form = reactive({
  name_fr: '',
  name_en: '',
  category: '',
  description_fr: '',
  description_en: '',
  fileUrl: '',
  language: 'Francais',
  active: true
})

onMounted(() => {
  loadGuides()

  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const loadGuides = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('guides')
    const data = saved ? JSON.parse(saved) : getDefaultGuides()
    guides.value = data.map((g: any) => ({
      ...g,
      name_fr: g.name_fr || g.name || '',
      name_en: g.name_en || '',
      description_fr: g.description_fr || g.description || '',
      description_en: g.description_en || ''
    }))
  }
}

const saveToLocalStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('guides', JSON.stringify(guides.value))
  }
}

const getDefaultGuides = (): Guide[] => [
  {
    id: 'guide_1',
    name_fr: 'Guide Import Chine-Afrique',
    name_en: 'Import Guide China-Africa',
    category: 'import',
    description_fr: 'Guide complet pour importer des marchandises de Chine vers l\'Afrique',
    description_en: 'Complete guide for importing goods from China to Africa',
    fileUrl: '',
    language: 'Francais',
    active: true
  },
  {
    id: 'guide_2',
    name_fr: 'Procedures Douanieres',
    name_en: 'Customs Procedures',
    category: 'douane',
    description_fr: 'Tout savoir sur les procedures douanieres et les documents requis',
    description_en: 'All about customs procedures and required documents',
    fileUrl: '',
    language: 'Francais',
    active: true
  }
]

const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    import: 'bi bi-box-arrow-in-down',
    export: 'bi bi-box-arrow-up',
    douane: 'bi bi-building',
    transport: 'bi bi-truck',
    paiement: 'bi bi-credit-card',
    general: 'bi bi-book'
  }
  return icons[category] || 'bi bi-file-text'
}

const resetForm = () => {
  form.name_fr = ''
  form.name_en = ''
  form.category = ''
  form.description_fr = ''
  form.description_en = ''
  form.fileUrl = ''
  form.language = 'Francais'
  form.active = true
}

const openModal = (guide?: Guide) => {
  if (guide) {
    editingGuide.value = guide
    form.name_fr = guide.name_fr || (guide as any).name || ''
    form.name_en = guide.name_en || ''
    form.category = guide.category
    form.description_fr = guide.description_fr || (guide as any).description || ''
    form.description_en = guide.description_en || ''
    form.fileUrl = guide.fileUrl
    form.language = guide.language
    form.active = guide.active
  } else {
    editingGuide.value = null
    resetForm()
  }
  modalInstance?.show()
}

const saveGuide = () => {
  const guideData: Partial<Guide> = {
    name_fr: form.name_fr,
    name_en: form.name_en,
    category: form.category,
    description_fr: form.description_fr,
    description_en: form.description_en,
    fileUrl: form.fileUrl,
    language: form.language,
    active: form.active
  }

  if (editingGuide.value) {
    const idx = guides.value.findIndex(g => g.id === editingGuide.value!.id)
    if (idx !== -1) {
      guides.value[idx] = {
        ...guides.value[idx],
        ...guideData
      } as Guide
    }
    success('Guide modifié')
  } else {
    const newGuide: Guide = {
      id: `guide_${Date.now()}`,
      ...guideData
    } as Guide
    guides.value.unshift(newGuide)
    success('Guide créé')
  }

  saveToLocalStorage()
  modalInstance?.hide()
  resetForm()
}

const handlePdfUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && file.type === 'application/pdf') {
    const reader = new FileReader()
    reader.onload = (e) => {
      form.fileUrl = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const deleteGuide = (id: string) => {
  if (!confirm('Supprimer ce guide ?')) return

  guides.value = guides.value.filter(g => g.id !== id)
  saveToLocalStorage()
  success('Guide supprime')
}
</script>

<style scoped>
.guide-icon {
  width: 40px;
  height: 40px;
  background: var(--bs-light);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bs-primary);
}
</style>

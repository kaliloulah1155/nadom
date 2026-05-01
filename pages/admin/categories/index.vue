<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Gestion des catégories</h4>
        <p class="text-muted mb-0">{{ psStore.categoriesMeta.total }} catégories</p>
      </div>
      <button v-can="['create', 'categories']" class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>Nouvelle catégorie
      </button>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-3">
      <div class="card-body py-3">
        <div class="row g-2 align-items-center">
          <div class="col-md-4">
            <label class="form-label small text-muted mb-1">Filtrer par slug (type)</label>
            <select v-model="filterSlug" class="form-select form-select-sm" @change="fetchCategories(1)">
              <option value="">— Tous les types —</option>
              <option value="POD">POD · Produits</option>
              <option value="DVS">DVS · Devises</option>
              <option value="MEX">MEX · Modes d'expédition</option>
              <option value="TVS">TVS · Types de visa</option>
              <option value="BLG">BLG · Blog</option>
              <option value="FAQ">FAQ · Questions</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted mb-1">Lignes / page</label>
            <select
              :value="psStore.categoriesMeta.perPage"
              class="form-select form-select-sm"
              @change="(e) => fetchCategories(1, Number((e.target as HTMLSelectElement).value))"
            >
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
          <div class="col-md-5 text-md-end small text-muted">
            Page {{ psStore.categoriesMeta.currentPage }} / {{ psStore.categoriesMeta.lastPage }}
          </div>
        </div>
      </div>
    </div>

    <!-- Categories Table -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Label</th>
              <th>Slug</th>
              <th>Code</th>
              <th>Statut</th>
              <th>Ordre</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cat in categories" :key="cat.uuid">
              <td class="fw-medium">{{ cat.label }}</td>
              <td><code>{{ cat.slug }}</code></td>
              <td><span v-if="cat.code" class="badge bg-secondary">{{ cat.code }}</span></td>
              <td>
                <span :class="['badge', cat.status === '1' ? 'bg-success' : cat.status === '2' ? 'bg-warning' : 'bg-secondary']">
                  {{ getStatusLabel(cat.status) }}
                </span>
              </td>
              <td>{{ cat.sort_order }}</td>
              <td>
                <div class="d-flex gap-2">
                  <button v-can="['update', 'categories']" class="btn btn-sm btn-outline-primary" @click="openModal(cat)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button v-can="['delete', 'categories']" class="btn btn-sm btn-outline-danger" @click="confirmDelete(cat.uuid)">
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
    <div class="card border-0 shadow-sm">
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          v-model:current-page="psStore.categoriesMeta.currentPage"
          v-model:limit="psStore.categoriesMeta.perPage"
          :total-items="psStore.categoriesMeta.total"
          @update:current-page="(p: number) => fetchCategories(p)"
          @update:limit="(l: number) => fetchCategories(1, l)"
        />
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="categoryModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingCategory ? 'Modifier' : 'Nouvelle' }} catégorie</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveCategory">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-8">
                  <label class="form-label">Label *</label>
                  <input v-model="form.label" type="text" class="form-control" required />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Slug *</label>
                  <ClientOnly>
                    <Multiselect
                      v-if="modalOpen"
                      v-model="slugSelected"
                      :options="slugOptions"
                      :taggable="true"
                      :searchable="true"
                      :show-no-options="false"
                      track-by="value"
                      label="label"
                      placeholder="Sélectionner ou créer un slug"
                      tag-placeholder="Ajouter ce nouveau slug"
                      select-label=""
                      deselect-label=""
                      selected-label=""
                      @tag="addSlugTag"
                    />
                  </ClientOnly>
                  <small class="text-muted">Ex: MEX, POD, DVS · Tapez pour créer un nouveau slug</small>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Code</label>
                  <input v-model="form.code" type="text" class="form-control" placeholder="air_express" />
                </div>
                <div class="col-md-4">
                  <label class="form-label d-flex justify-content-between align-items-center">
                    <span>Icône</span>
                    <a
                      href="https://icons.getbootstrap.com/"
                      target="_blank"
                      rel="noopener"
                      class="small text-decoration-none"
                      title="Voir tous les icônes Bootstrap"
                    >
                      <i class="bi bi-box-arrow-up-right me-1"></i>Voir les icônes
                    </a>
                  </label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i v-if="form.icon" :class="form.icon"></i>
                      <i v-else class="bi bi-image text-muted"></i>
                    </span>
                    <input v-model="form.icon" type="text" class="form-control" placeholder="bi bi-airplane" />
                  </div>
                  <small class="text-muted">Classe Bootstrap Icons (ex: <code>bi bi-airplane</code>)</small>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Ordre de tri</label>
                  <input v-model.number="form.sort_order" type="number" class="form-control" min="0" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Statut</label>
                  <select v-model="form.status" class="form-select">
                    <option value="1">Actif</option>
                    <option value="2">Inactif</option>
                    <option value="0">Archivé</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Catégorie parente</label>
                  <select v-model="form.parent_uuid" class="form-select">
                    <option :value="null">Aucune</option>
                    <option v-for="cat in parentOptions" :key="cat.uuid" :value="cat.uuid">
                      {{ cat.label }}
                    </option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label">Description</label>
                  <ClientOnly>
                    <WysiwygEditor
                      v-if="modalOpen"
                      v-model="form.description"
                      height="180px"
                      placeholder="Décrivez la catégorie..."
                    />
                  </ClientOnly>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
              <button type="submit" class="btn btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'
import { usePersonalShoppingStore } from '~/stores/personalShopping'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'admin'
})

const psStore = usePersonalShoppingStore()
const { success, error } = useNotification()

const categories = computed(() => psStore.categories)
const editingCategory = ref<any>(null)
const modalRef = ref<HTMLElement | null>(null)
const modalOpen = ref(false)
let modalInstance: any = null

const parentOptions = computed(() => {
  return categories.value.filter((c: any) => c.uuid !== editingCategory.value?.uuid)
})

const form = reactive({
  label: '',
  slug: '',
  code: '',
  description: '',
  icon: '',
  sort_order: 0,
  status: '1',
  parent_uuid: null as string | null
})

const filterSlug = ref('')

type SlugOption = { value: string; label: string }

const KNOWN_SLUGS: SlugOption[] = [
  { value: 'POD', label: 'POD · Produits' },
  { value: 'DVS', label: 'DVS · Devises' },
  { value: 'MEX', label: 'MEX · Modes d\'expédition' },
  { value: 'TVS', label: 'TVS · Types de visa' },
  { value: 'BLG', label: 'BLG · Blog' },
  { value: 'FAQ', label: 'FAQ · Questions' },
]

const slugOptions = computed<SlugOption[]>(() => {
  const fromCategories = (categories.value || [])
    .map((c: any) => (c.slug || '').toString().toUpperCase())
    .filter(Boolean)
  const merged = new Map<string, SlugOption>()
  for (const opt of KNOWN_SLUGS) merged.set(opt.value, opt)
  for (const slug of fromCategories) {
    if (!merged.has(slug)) merged.set(slug, { value: slug, label: slug })
  }
  return Array.from(merged.values()).sort((a, b) => a.value.localeCompare(b.value))
})

const slugSelected = ref<SlugOption | null>(null)

watch(slugSelected, (val) => {
  form.slug = val?.value || ''
})

const addSlugTag = (newSlug: string) => {
  const value = (newSlug || '').toString().trim().toUpperCase()
  if (!value) return
  slugSelected.value = { value, label: value }
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    '0': 'Archivé',
    '1': 'Actif',
    '2': 'Inactif'
  }
  return labels[status] || status
}

const fetchCategories = async (page?: number, limit?: number) => {
  await psStore.fetchCategories({
    page: page ?? psStore.categoriesMeta.currentPage,
    limit: limit ?? psStore.categoriesMeta.perPage,
    slug: filterSlug.value || undefined,
  })
}

onMounted(async () => {
  await fetchCategories(1)
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
    modalRef.value?.addEventListener('shown.bs.modal', () => {
      modalOpen.value = true
    })
    modalRef.value?.addEventListener('hidden.bs.modal', () => {
      modalOpen.value = false
    })
  }
})

const syncSlugSelected = (slug: string) => {
  if (!slug) {
    slugSelected.value = null
    return
  }
  const value = slug.toUpperCase()
  slugSelected.value =
    slugOptions.value.find(o => o.value === value) || { value, label: value }
}

const openModal = (cat?: any) => {
  if (cat) {
    editingCategory.value = cat
    form.label = cat.label
    form.slug = cat.slug
    form.code = cat.code || ''
    form.description = cat.description || ''
    form.icon = cat.icon || ''
    form.sort_order = cat.sort_order || 0
    form.status = cat.status
    form.parent_uuid = cat.parent?.uuid || null
  } else {
    editingCategory.value = null
    form.label = ''
    form.slug = ''
    form.code = ''
    form.description = ''
    form.icon = ''
    form.sort_order = 0
    form.status = '1'
    form.parent_uuid = null
  }
  syncSlugSelected(form.slug)
  modalInstance?.show()
}

const saveCategory = async () => {
  if (!form.slug) {
    error('Le slug est obligatoire')
    return
  }
  const data = {
    label: form.label,
    slug: form.slug,
    code: form.code || null,
    description: form.description || null,
    icon: form.icon || null,
    sort_order: form.sort_order,
    status: form.status,
    parent_uuid: form.parent_uuid
  }

  try {
    if (editingCategory.value) {
      await psStore.updateCategory(editingCategory.value.uuid, data)
      success('Catégorie modifiée')
    } else {
      await psStore.addCategory(data)
      success('Catégorie créée')
    }
    modalInstance?.hide()
  } catch (err: any) {
    error(err.message)
  }
}

const confirmDelete = async (uuid: string) => {
  if (confirm('Supprimer cette catégorie ?')) {
    await psStore.deleteCategory(uuid)
    success('Catégorie supprimée')
  }
}
</script>

<style>
/* Restaure la bordure du multiselect dans la modale (le style global le retire) */
#categoryModal .multiselect__tags {
  padding: 8px 40px 0 8px !important;
  border: 1px solid #ced4da !important;
  border-radius: 0.375rem !important;
  min-height: 38px;
}
#categoryModal .multiselect__select {
  height: 38px !important;
}
#categoryModal .multiselect__placeholder {
  margin-bottom: 8px;
  padding-top: 0;
}
#categoryModal .multiselect__single {
  margin-bottom: 8px;
  padding-left: 0;
}
#categoryModal .multiselect__input {
  margin-bottom: 8px;
  padding-left: 0;
}
</style>
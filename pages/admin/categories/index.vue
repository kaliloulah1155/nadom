<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Gestion des catégories</h4>
        <p class="text-muted mb-0">{{ categories.length }} catégories configurées</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>Nouvelle catégorie
      </button>
    </div>

    <!-- Categories Table -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Icon</th>
              <th>Nom (FR)</th>
              <th>Name (EN)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cat in paginatedCategories" :key="cat.id">
              <td>
                <div class="cat-icon" :style="{ background: cat.color + '20', color: cat.color }">
                  <i :class="['bi', cat.icon]"></i>
                </div>
              </td>
              <td class="fw-medium">{{ cat.name_fr }}</td>
              <td>{{ cat.name_en }}</td>
              <td>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-outline-primary" @click="openModal(cat)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(cat.id)">
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
          v-model:current-page="currentPage"
          v-model:limit="perPage"
          :total-items="categories.length"
        />
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="categoryModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingCategory ? 'Modifier' : 'Nouvelle' }} catégorie</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveCategory">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Nom (FR) *</label>
                  <input v-model="form.name_fr" type="text" class="form-control" required />
                </div>
                <div class="col-12">
                  <label class="form-label">Name (EN) *</label>
                  <input v-model="form.name_en" type="text" class="form-control" required />
                </div>
                <div class="col-12">
                  <label class="form-label">Icon (Bootstrap Icon)</label>
                  <div class="input-group">
                    <input v-model="form.icon" type="text" class="form-control" placeholder="bi-tag" />
                    <a href="https://icons.getbootstrap.com/" target="_blank" class="btn btn-outline-secondary" title="Voir les icônes Bootstrap">
                      <i class="bi bi-box-arrow-up-right"></i>
                    </a>
                  </div>
                  <small class="text-muted">Exemple: bi-tag, bi-star, bi-heart, etc.</small>
                  <div v-if="form.icon" class="mt-2">
                    <span class="badge p-2" :style="{ background: form.color + '20', color: form.color }">
                      <i :class="['bi', form.icon, 'fs-4']"></i>
                      <span class="ms-2">Aperçu</span>
                    </span>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Couleur</label>
                  <input v-model="form.color" type="color" class="form-control form-control-color w-100" />
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
import { ref, reactive, computed, onMounted } from 'vue'
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
let modalInstance: any = null

const currentPage = ref(1)
const perPage = ref(10)

const form = reactive({
  name_fr: '',
  name_en: '',
  icon: 'bi-tag',
  color: '#3498db'
})

onMounted(async () => {
  await psStore.fetchCategories()
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return categories.value.slice(start, start + perPage.value)
})

const openModal = (cat?: any) => {
  if (cat) {
    editingCategory.value = cat
    form.name_fr = cat.name_fr
    form.name_en = cat.name_en
    form.icon = cat.icon
    form.color = cat.color
  } else {
    editingCategory.value = null
    form.name_fr = ''
    form.name_en = ''
    form.icon = 'bi-tag'
    form.color = '#3498db'
  }
  modalInstance?.show()
}

const saveCategory = async () => {
  if (editingCategory.value) {
    await psStore.updateCategory(editingCategory.value.id, { ...form })
    success('Catégorie modifiée')
  } else {
    await psStore.addCategory({ ...form })
    success('Catégorie créée')
  }
  modalInstance?.hide()
}

const confirmDelete = async (id: string) => {
  if (confirm('Supprimer cette catégorie ?')) {
    await psStore.deleteCategory(id)
    success('Catégorie supprimée')
  }
}
</script>

<style scoped>
.cat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}
</style>

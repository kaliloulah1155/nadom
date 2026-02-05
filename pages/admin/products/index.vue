<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Gestion des produits</h4>
        <p class="text-muted mb-0">{{ products.length }} produits configurés</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>Nouveau produit
      </button>
    </div>

    <!-- Tools -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-transparent border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input v-model="searchQuery" type="text" class="form-control border-start-0" placeholder="Rechercher un produit..." />
            </div>
          </div>
          <div class="col-md-4">
            <select v-model="categoryFilter" class="form-select">
              <option value="">Toutes les catégories</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name_fr }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Products Table -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr>
              <th class="px-4 py-3 border-0">Produit</th>
              <th class="py-3 border-0">Catégorie</th>
              <th class="py-3 border-0">Prix</th>
              <th class="py-3 border-0">Description</th>
              <th class="py-3 border-0 text-end px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prod in paginatedProducts" :key="prod.id">
              <td class="px-4">
                <div class="d-flex align-items-center gap-3">
                  <img :src="prod.image || 'https://placehold.co/50x50?text=No+Img'" class="rounded border" width="45" height="45" style="object-fit: cover;" />
                  <div class="fw-bold">{{ prod.name_fr }}</div>
                </div>
              </td>
              <td>
                <span class="badge bg-light text-primary border border-primary-subtle px-2 py-1">
                  {{ getCategoryName(prod.categoryId) }}
                </span>
              </td>
              <td class="fw-bold text-primary">{{ prod.price.toLocaleString() }} FCFA</td>
              <td>
                <div class="text-muted small text-truncate" style="max-width: 250px;">
                  {{ prod.description_fr }}
                </div>
              </td>
              <td class="text-end px-4">
                <div class="d-flex justify-content-end gap-2">
                  <button class="btn btn-sm btn-outline-primary" @click="openModal(prod)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(prod.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredProducts.length === 0">
              <td colspan="5" class="text-center py-5">
                <i class="bi bi-box-seam fs-1 text-muted mb-3 d-block"></i>
                <p class="text-muted mb-0">Aucun produit trouvé</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer bg-transparent py-3 border-top-0">
        <AdminPagination
          v-model:current-page="currentPage"
          v-model:limit="perPage"
          :total-items="filteredProducts.length"
        />
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="productModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingProduct ? 'Modifier' : 'Nouveau' }} produit</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveProduct">
            <div class="modal-body">
              <ul class="nav nav-tabs mb-3">
                <li class="nav-item">
                  <button type="button" class="nav-link active" data-bs-toggle="tab" data-bs-target="#prod-fr">Français</button>
                </li>
                <li class="nav-item">
                  <button type="button" class="nav-link" data-bs-toggle="tab" data-bs-target="#prod-en">English</button>
                </li>
              </ul>

              <div class="tab-content mb-3">
                <div class="tab-pane fade show active" id="prod-fr">
                  <div class="mb-3">
                    <label class="form-label">Nom du produit (FR) *</label>
                    <input v-model="form.name_fr" type="text" class="form-control" required />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Description (FR)</label>
                    <textarea v-model="form.description_fr" class="form-control" rows="3"></textarea>
                  </div>
                </div>
                <div class="tab-pane fade" id="prod-en">
                  <div class="mb-3">
                    <label class="form-label">Product Name (EN) *</label>
                    <input v-model="form.name_en" type="text" class="form-control" required />
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Description (EN)</label>
                    <textarea v-model="form.description_en" class="form-control" rows="3"></textarea>
                  </div>
                </div>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Catégorie *</label>
                  <select v-model="form.categoryId" class="form-select" required>
                    <option value="">Sélectionnez une catégorie</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                      {{ cat.name_fr }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Prix (FCFA) *</label>
                  <input v-model.number="form.price" type="number" class="form-control" required min="0" />
                </div>
                
                <div class="col-12">
                  <label class="form-label">Image du produit</label>
                  <div class="d-flex gap-3 align-items-start">
                    <div class="image-upload-wrapper border rounded-3 overflow-hidden bg-light" style="width: 120px; height: 120px; flex-shrink: 0;">
                      <img v-if="form.image" :src="form.image" class="w-100 h-100 object-fit-cover" />
                      <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                        <i class="bi bi-image fs-1"></i>
                      </div>
                    </div>
                    <div class="flex-grow-1">
                      <div class="mb-3">
                        <input type="file" class="form-control" @change="handleImageUpload" accept="image/*" />
                        <div class="form-text">Formats acceptés: JPG, PNG, WebP. Max 2Mo.</div>
                      </div>
                      <div class="input-group">
                        <span class="input-group-text small">OU URL</span>
                        <input v-model="form.image" type="text" class="form-control" placeholder="https://..." />
                        <button type="button" class="btn btn-outline-secondary" @click="generateDemoImage">
                          <i class="bi bi-magic me-1"></i>Démo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
              <button type="submit" class="btn btn-primary" :disabled="isUploading">
                <span v-if="isUploading" class="spinner-border spinner-border-sm me-2"></span>
                Enregistrer
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
import { usePersonalShoppingStore } from '~/stores/personalShopping'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'admin'
})

const psStore = usePersonalShoppingStore()
const { success, error } = useNotification()

const products = computed(() => psStore.products)
const categories = computed(() => psStore.categories)

const searchQuery = ref('')
const categoryFilter = ref('')
const currentPage = ref(1)
const perPage = ref(12)

const editingProduct = ref<any>(null)
const modalRef = ref<HTMLElement | null>(null)
const isUploading = ref(false)
let modalInstance: any = null

const form = reactive({
  categoryId: '',
  name_fr: '',
  name_en: '',
  description_fr: '',
  description_en: '',
  price: 0,
  image: ''
})

onMounted(async () => {
  await psStore.fetchCategories()
  await psStore.fetchProducts()
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchesSearch = p.name_fr.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          p.name_en.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = !categoryFilter.value || p.categoryId === categoryFilter.value
    return matchesSearch && matchesCategory
  })
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredProducts.value.slice(start, start + perPage.value)
})

const getCategoryName = (id: string) => {
  const cat = categories.value.find(c => c.id === id)
  return cat ? cat.name_fr : 'Inconnue'
}

const handleImageUpload = (event: any) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    error('L\'image est trop lourde (max 2Mo)')
    return
  }

  isUploading.value = true
  const reader = new FileReader()
  reader.onload = (e: any) => {
    form.image = e.target.result
    isUploading.value = false
  }
  reader.onerror = () => {
    error('Erreur lors de la lecture du fichier')
    isUploading.value = false
  }
  reader.readAsDataURL(file)
}

const openModal = (prod?: any) => {
  if (prod) {
    editingProduct.value = prod
    Object.assign(form, prod)
  } else {
    editingProduct.value = null
    Object.assign(form, {
      categoryId: '',
      name_fr: '',
      name_en: '',
      description_fr: '',
      description_en: '',
      price: 0,
      image: ''
    })
  }
  modalInstance?.show()
}

const saveProduct = async () => {
  try {
    if (editingProduct.value) {
      await psStore.updateProduct(editingProduct.value.id, { ...form })
      success('Produit modifié')
    } else {
      await psStore.createProduct({ ...form })
      success('Produit créé')
    }
    modalInstance?.hide()
  } catch (err) {
    error('Erreur lors de l\'enregistrement')
  }
}

const confirmDelete = async (id: string) => {
  if (confirm('Supprimer ce produit ?')) {
    await psStore.deleteProduct(id)
    success('Produit supprimé')
  }
}

const generateDemoImage = () => {
  const keywords = form.name_en.split(' ').join(',')
  form.image = `https://loremflickr.com/400/400/${keywords || 'product'}`
}
</script>

<style scoped>
.object-fit-cover {
  object-fit: cover;
}
.image-upload-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

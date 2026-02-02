<template>
  <div class="page-wrapper">
    <!-- Hero Banner -->
    <section class="page-hero">
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-lg-8 text-center text-white">
            <h1 class="fw-bold text-white">{{ t('personalShopping.newRequest') }}</h1>
            <p class="opacity-75 text-white">{{ locale === 'fr' ? 'Decrivez le produit que vous recherchez' : 'Describe the product you are looking for' }}</p>
          </div>
        </div>
      </div>
    </section>

    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <!-- Form Card -->
          <div class="card border-0 shadow-lg">
            <div class="card-body p-4 p-lg-5">
              <form @submit.prevent="handleSubmit">
                <!-- Category -->
                <div class="mb-4">
                  <label class="form-label fw-medium">{{ t('personalShopping.form.category') }} *</label>
                  <select
                    v-model="form.category"
                    class="form-select form-select-lg"
                    :class="{ 'is-invalid': errors.category }"
                    required
                  >
                    <option value="">{{ locale === 'fr' ? 'Selectionnez une categorie' : 'Select a category' }}</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.name">
                      {{ cat.name }}
                    </option>
                  </select>
                  <div v-if="errors.category" class="invalid-feedback">{{ errors.category }}</div>
                </div>

                <!-- Title -->
                <div class="mb-4">
                  <label class="form-label fw-medium">{{ t('personalShopping.form.productName') }} *</label>
                  <input
                    v-model="form.title"
                    type="text"
                    class="form-control form-control-lg"
                    :class="{ 'is-invalid': errors.title }"
                    :placeholder="locale === 'fr' ? 'Ex: Samsung Galaxy S24 Ultra 256GB' : 'Ex: Samsung Galaxy S24 Ultra 256GB'"
                    required
                  />
                  <div v-if="errors.title" class="invalid-feedback">{{ errors.title }}</div>
                </div>

                <!-- Description -->
                <div class="mb-4">
                  <label class="form-label fw-medium">{{ t('personalShopping.form.description') }} *</label>
                  <textarea
                    v-model="form.description"
                    class="form-control"
                    :class="{ 'is-invalid': errors.description }"
                    rows="4"
                    :placeholder="locale === 'fr' ? 'Decrivez le produit en detail: couleur, taille, caracteristiques, references...' : 'Describe the product in detail: color, size, features, references...'"
                    required
                  ></textarea>
                  <div v-if="errors.description" class="invalid-feedback">{{ errors.description }}</div>
                </div>

                <!-- Image Upload -->
                <div class="mb-4">
                  <label class="form-label fw-medium">{{ t('personalShopping.form.images') }}</label>
                  <p class="text-muted small mb-3">{{ locale === 'fr' ? 'Televersez des images du produit que vous recherchez (max 5 images)' : 'Upload images of the product you are looking for (max 5 images)' }}</p>

                  <!-- Upload Zone -->
                  <div
                    class="upload-zone"
                    :class="{ 'dragging': isDragging }"
                    @dragover.prevent="isDragging = true"
                    @dragleave.prevent="isDragging = false"
                    @drop.prevent="handleDrop"
                    @click="triggerFileInput"
                  >
                    <input
                      ref="fileInput"
                      type="file"
                      multiple
                      accept="image/*"
                      class="d-none"
                      @change="handleFileSelect"
                    />
                    <div class="text-center py-4">
                      <i class="bi bi-cloud-arrow-up fs-1 text-primary mb-2"></i>
                      <p class="mb-1 fw-medium">{{ t('personalShopping.form.dragDrop') }}</p>
                      <p class="text-muted small mb-2">{{ t('personalShopping.form.or') }}</p>
                      <button type="button" class="btn btn-outline-primary btn-sm">
                        <i class="bi bi-folder2-open me-1"></i>{{ t('personalShopping.form.browse') }}
                      </button>
                    </div>
                  </div>

                  <!-- Image Previews -->
                  <div v-if="imagePreviews.length > 0" class="row g-3 mt-3">
                    <div v-for="(preview, index) in imagePreviews" :key="index" class="col-4 col-md-3">
                      <div class="image-preview position-relative">
                        <img
                          :src="preview"
                          :alt="`Image ${index + 1}`"
                          class="img-fluid rounded cursor-zoom"
                          @click="openZoom(preview)"
                        />
                        <button
                          type="button"
                          class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle"
                          style="width: 24px; height: 24px; padding: 0;"
                          @click="removeImage(index)"
                        >
                          <i class="bi bi-x"></i>
                        </button>
                        <div class="zoom-hint">
                          <i class="bi bi-zoom-in"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <!-- Quantity -->
                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-medium">{{ t('personalShopping.form.quantity') }} *</label>
                    <input
                      v-model.number="form.quantity"
                      type="number"
                      class="form-control form-control-lg"
                      :class="{ 'is-invalid': errors.quantity }"
                      min="1"
                      required
                    />
                    <div v-if="errors.quantity" class="invalid-feedback">{{ errors.quantity }}</div>
                  </div>

                  <!-- Budget -->
                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-medium">{{ t('personalShopping.form.budget') }} ({{ t('common.currency') }}) *</label>
                    <input
                      v-model.number="form.budgetEstimated"
                      type="number"
                      class="form-control form-control-lg"
                      :class="{ 'is-invalid': errors.budgetEstimated }"
                      placeholder="500000"
                      min="10000"
                      required
                    />
                    <div v-if="errors.budgetEstimated" class="invalid-feedback">{{ errors.budgetEstimated }}</div>
                    <small class="text-muted">{{ locale === 'fr' ? 'Budget pour la totalite (produit + expedition)' : 'Budget for everything (product + shipping)' }}</small>
                  </div>
                </div>

                <!-- Info Box -->
                <div class="alert alert-primary mb-4 border-0">
                  <div class="d-flex">
                    <i class="bi bi-info-circle fs-4 me-3"></i>
                    <div>
                      <strong>{{ locale === 'fr' ? 'Comment ca se passe ?' : 'What happens next?' }}</strong>
                      <p class="mb-0 small">
                        {{ locale === 'fr' ? 'Apres soumission, un agent vous contactera via WhatsApp sous 24-48h pour discuter des details et vous envoyer un devis.' : 'After submission, an agent will contact you via WhatsApp within 24-48h to discuss details and send you a quote.' }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Submit -->
                <div class="d-grid gap-2">
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg"
                    :disabled="loading"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? t('common.loading') : t('personalShopping.form.submit') }}
                  </button>
                  <NuxtLink to="/personal-shopping" class="btn btn-outline-secondary">
                    {{ t('common.cancel') }}
                  </NuxtLink>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Zoom Modal -->
    <div v-if="zoomedImage" class="zoom-modal" @click="closeZoom">
      <div class="zoom-content">
        <button class="zoom-close" @click="closeZoom">
          <i class="bi bi-x-lg"></i>
        </button>
        <img :src="zoomedImage" alt="Zoomed image" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { FAKE_CATEGORIES } from '~/utils/data/fakeData'
import { useAuthStore } from '~/stores/auth'
import { usePersonalShoppingStore } from '~/stores/personalShopping'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'default'
})

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const psStore = usePersonalShoppingStore()
const { success, error: notifyError } = useNotification()

const categories = FAKE_CATEGORIES
const loading = ref(false)
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const imagePreviews = ref<string[]>([])
const imageFiles = ref<File[]>([])
const zoomedImage = ref<string | null>(null)

const form = reactive({
  category: '',
  title: '',
  description: '',
  quantity: 1,
  budgetEstimated: null as number | null
})

const errors = reactive({
  category: '',
  title: '',
  description: '',
  quantity: '',
  budgetEstimated: ''
})

// File handling
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addFiles(Array.from(target.files))
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files))
  }
}

const addFiles = (files: File[]) => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const validFiles = files.filter(f => imageTypes.includes(f.type))

  if (imagePreviews.value.length + validFiles.length > 5) {
    notifyError(locale.value === 'fr' ? 'Maximum 5 images autorisees' : 'Maximum 5 images allowed')
    return
  }

  validFiles.forEach(file => {
    imageFiles.value.push(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        imagePreviews.value.push(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  })
}

const removeImage = (index: number) => {
  imagePreviews.value.splice(index, 1)
  imageFiles.value.splice(index, 1)
}

// Zoom
const openZoom = (image: string) => {
  zoomedImage.value = image
  document.body.style.overflow = 'hidden'
}

const closeZoom = () => {
  zoomedImage.value = null
  document.body.style.overflow = ''
}

// Form validation
const validateForm = () => {
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  const msgs = locale.value === 'fr' ? {
    category: 'Selectionnez une categorie',
    title: 'Titre trop court (min 5 caracteres)',
    description: 'Description trop courte (min 20 caracteres)',
    quantity: 'Quantite invalide',
    budget: 'Budget minimum 10 000 FCFA'
  } : {
    category: 'Select a category',
    title: 'Title too short (min 5 characters)',
    description: 'Description too short (min 20 characters)',
    quantity: 'Invalid quantity',
    budget: 'Minimum budget 10,000 FCFA'
  }

  if (!form.category) errors.category = msgs.category
  if (!form.title || form.title.length < 5) errors.title = msgs.title
  if (!form.description || form.description.length < 20) errors.description = msgs.description
  if (!form.quantity || form.quantity < 1) errors.quantity = msgs.quantity
  if (!form.budgetEstimated || form.budgetEstimated < 10000) errors.budgetEstimated = msgs.budget

  return !Object.values(errors).some(e => e)
}

const handleSubmit = async () => {
  if (!validateForm()) return

  if (!authStore.isAuthenticated) {
    notifyError(locale.value === 'fr' ? 'Veuillez vous connecter pour soumettre une demande' : 'Please login to submit a request')
    router.push('/login')
    return
  }

  loading.value = true

  try {
    const request = await psStore.createRequest({
      userId: authStore.userId,
      category: form.category,
      title: form.title,
      description: form.description,
      images: imagePreviews.value,
      quantity: form.quantity,
      budgetEstimated: form.budgetEstimated!
    })

    success(locale.value === 'fr' ? 'Demande soumise avec succes !' : 'Request submitted successfully!')
    router.push(`/personal-shopping/${request.id}`)
  } catch (err: any) {
    notifyError(err.message || (locale.value === 'fr' ? 'Erreur lors de la soumission' : 'Error submitting request'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page-wrapper {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.page-hero {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  margin-bottom: -50px;
  padding-bottom: 80px;
}

.upload-zone {
  border: 2px dashed #dee2e6;
  border-radius: 12px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-zone:hover,
.upload-zone.dragging {
  border-color: var(--bs-primary);
  background: rgba(var(--bs-primary-rgb), 0.05);
}

.image-preview {
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cursor-zoom {
  cursor: zoom-in;
}

.zoom-hint {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.5);
  color: white;
  text-align: center;
  padding: 4px;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview:hover .zoom-hint {
  opacity: 1;
}

.zoom-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.9);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}

.zoom-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.zoom-content img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

.zoom-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: transparent;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}
</style>

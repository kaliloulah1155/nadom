<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Gestion de la FAQ</h4>
        <p class="text-muted mb-0">{{ faqs.length }} questions configurées</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>Nouvelle question
      </button>
    </div>

    <!-- FAQ Table -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 250px;">Catégorie</th>
                <th>Question</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredFaqs.length === 0">
                <td colspan="3" class="text-center py-4 text-muted">
                  Aucune question trouvée
                </td>
              </tr>
              <tr v-for="faq in paginatedFaqs" :key="faq.id">
                <td>
                  <span class="badge bg-light text-dark">{{ faq.category }}</span>
                </td>
                <td>
                  <div class="fw-medium mb-1">{{ faq.question_fr }}</div>
                  <small class="text-muted d-block text-truncate" style="max-width: 500px;" v-html="truncate(faq.answer_fr, 100)">
                  </small>
                </td>
                <td>
                  <div class="d-flex">
                    <button class="btn btn-outline-primary btn-sm me-2" title="Modifier" @click="openModal(faq)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" title="Supprimer" @click="deleteFaq(faq.id)">
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
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          v-model:current-page="currentPage"
          v-model:limit="perPage"
          :total-items="filteredFaqs.length"
        />
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="faqModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingFaq ? 'Modifier' : 'Nouvelle' }} question</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveFaq">
            <div class="modal-body">
              <!-- Tabs for Bilingual Support -->
              <ul class="nav nav-tabs mb-3" id="faqLangTabs" role="tablist">
                <li class="nav-item" role="presentation">
                  <button class="nav-link active" id="faq-fr-tab" data-bs-toggle="tab" data-bs-target="#faq-fr-content" type="button" role="tab">Français</button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" id="faq-en-tab" data-bs-toggle="tab" data-bs-target="#faq-en-content" type="button" role="tab">English</button>
                </li>
              </ul>

              <div class="tab-content" id="faqLangTabsContent">
                <!-- French Tab -->
                <div class="tab-pane fade show active" id="faq-fr-content" role="tabpanel">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label">Question (FR) *</label>
                      <input v-model="form.question_fr" type="text" class="form-control" required />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Réponse (FR) *</label>
                      <WysiwygEditor v-model="form.answer_fr" height="200px" />
                    </div>
                  </div>
                </div>

                <!-- English Tab -->
                <div class="tab-pane fade" id="faq-en-content" role="tabpanel">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label">Question (EN)</label>
                      <input v-model="form.question_en" type="text" class="form-control" placeholder="English question..." />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Answer (EN)</label>
                      <WysiwygEditor v-model="form.answer_en" height="200px" placeholder="English answer..." />
                    </div>
                  </div>
                </div>
              </div>

              <hr class="my-4">

              <div class="row g-3">
                <div class="col-md-12">
                  <label class="form-label">Catégorie *</label>
                  <select v-model="form.category" class="form-select" required>
                    <option value="">Sélectionnez</option>
                    <option value="Général">Général</option>
                    <option value="Visas">Visas</option>
                    <option value="Shipping">Shipping</option>
                    <option value="Pricing">Pricing</option>
                  </select>
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
import { useBlogStore, type FAQ } from '~/stores/blog'
import { useNotification } from '~/composables/useNotification'
import { useFormatters } from '~/composables/useFormatters'
import WysiwygEditor from '~/components/admin/WysiwygEditor.vue'

definePageMeta({
  layout: 'admin'
})

const blogStore = useBlogStore()
const { success, error } = useNotification()
const { truncate } = useFormatters()

const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null

const editingFaq = ref<FAQ | null>(null)
const currentPage = ref(1)
const perPage = ref(10)

const form = reactive({
  question_fr: '',
  question_en: '',
  answer_fr: '',
  answer_en: '',
  category: ''
})

onMounted(async () => {
  await blogStore.fetchFAQ()
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const faqs = computed(() => blogStore.faq)

const filteredFaqs = computed(() => {
  // Add search filtering if needed later
  return faqs.value
})

const paginatedFaqs = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredFaqs.value.slice(start, start + perPage.value)
})

const resetForm = () => {
  form.question_fr = ''
  form.question_en = ''
  form.answer_fr = ''
  form.answer_en = ''
  form.category = ''
}

const openModal = (faq?: FAQ) => {
  if (faq) {
    editingFaq.value = faq
    form.question_fr = faq.question_fr || ''
    form.question_en = faq.question_en || ''
    form.answer_fr = faq.answer_fr || ''
    form.answer_en = faq.answer_en || ''
    form.category = faq.category
  } else {
    editingFaq.value = null
    resetForm()
  }
  modalInstance?.show()
}

const saveFaq = async () => {
  const faqData: Partial<FAQ> = { ...form }
  
  if (editingFaq.value) {
    await blogStore.updateFAQ(editingFaq.value.id, faqData)
    success('Question modifiée')
  } else {
    await blogStore.createFAQ(faqData)
    success('Question créée')
  }
  
  modalInstance?.hide()
  resetForm()
}

const deleteFaq = async (id: string) => {
  if (!confirm('Supprimer cette question ?')) return
  await blogStore.deleteFAQ(id)
  success('Question supprimée')
}
</script>

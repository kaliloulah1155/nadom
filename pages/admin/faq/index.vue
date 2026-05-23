<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">{{ t('admin.faq.title') }}</h4>
        <p class="text-muted mb-0">{{ t('admin.faq.totalCount', { n: blogStore.faqMeta.total }) }}</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>{{ t('admin.faq.newQuestion') }}
      </button>
    </div>

    <!-- FAQ Table -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 250px;">{{ t('admin.faq.category') }}</th>
                <th>{{ t('admin.faq.question') }}</th>
                <th>{{ t('admin.common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="faqs.length === 0">
                <td colspan="3" class="text-center py-4 text-muted">
                  {{ t('admin.faq.noQuestions') }}
                </td>
              </tr>
              <tr v-for="faq in faqs" :key="faq.id">
                <td>
                  <span class="badge bg-light text-dark">{{ faq.category }}</span>
                </td>
                <td>
                  <div class="fw-medium mb-1">{{ faq.question_fr }}</div>
                  <small class="text-muted d-block text-truncate" style="max-width: 500px;" v-html="truncate(faq.answer_fr || '', 100)">
                  </small>
                </td>
                <td>
                  <div class="d-flex">
                    <button class="btn btn-outline-primary btn-sm me-2" :title="t('admin.common.edit')" @click="openModal(faq)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" :title="t('admin.common.delete')" @click="deleteFaq(faq.id)">
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
          v-model:current-page="blogStore.faqMeta.currentPage"
          v-model:limit="blogStore.faqMeta.perPage"
          :total-items="blogStore.faqMeta.total"
          @update:current-page="(p: number) => fetchFAQ(p)"
          @update:limit="(l: number) => fetchFAQ(1, l)"
        />
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="faqModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingFaq ? t('admin.faq.modalEdit') : t('admin.faq.modalNew') }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveFaq">
            <div class="modal-body">
              <ul class="nav nav-tabs mb-3">
                <li class="nav-item">
                  <button type="button" class="nav-link active" data-bs-toggle="tab" data-bs-target="#faq-fr">{{ t('admin.common.french') }}</button>
                </li>
                <li class="nav-item">
                  <button type="button" class="nav-link" data-bs-toggle="tab" data-bs-target="#faq-en">{{ t('admin.common.english') }}</button>
                </li>
                <li class="nav-item">
                  <button type="button" class="nav-link" data-bs-toggle="tab" data-bs-target="#faq-zh">{{ t('admin.common.chinese') }}</button>
                </li>
              </ul>

              <div class="tab-content mb-3">
                <div class="tab-pane fade show active" id="faq-fr">
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
                <div class="tab-pane fade" id="faq-en">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label">Question (EN) *</label>
                      <input v-model="form.question_en" type="text" class="form-control" />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Answer (EN) *</label>
                      <WysiwygEditor v-model="form.answer_en" height="200px" />
                    </div>
                  </div>
                </div>
                <div class="tab-pane fade" id="faq-zh">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label">问题 (中文)</label>
                      <input v-model="form.question_zh" type="text" class="form-control" />
                    </div>
                    <div class="col-12">
                      <label class="form-label">回答 (中文)</label>
                      <WysiwygEditor v-model="form.answer_zh" height="200px" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Catégorie</label>
                  <input v-model="form.category" type="text" class="form-control" placeholder="Général, Shipping, Visa, etc." />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ t('admin.common.cancel') }}</button>
              <button type="submit" class="btn btn-primary">{{ t('admin.common.save') }}</button>
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
import { useBlogStore } from '~/stores/blog'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'admin'
})

const blogStore = useBlogStore()
const { success, error } = useNotification()

const faqs = computed(() => blogStore.faq)

const editingFaq = ref<any>(null)
const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null

const form = reactive({
  question_fr: '',
  question_en: '',
  question_zh: '',
  answer_fr: '',
  answer_en: '',
  answer_zh: '',
  category: ''
})

const fetchFAQ = async (page?: number, limit?: number) => {
  await blogStore.fetchFAQ({
    page: page ?? blogStore.faqMeta.currentPage,
    limit: limit ?? blogStore.faqMeta.perPage
  })
}

const truncate = (str: string, len: number) => {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}

onMounted(async () => {
  await fetchFAQ(1)
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const openModal = (faq?: any) => {
  if (faq) {
    editingFaq.value = faq
    form.question_fr = faq.question_fr || ''
    form.question_en = faq.question_en || ''
    form.question_zh = faq.question_zh || ''
    form.answer_fr = faq.answer_fr || ''
    form.answer_en = faq.answer_en || ''
    form.answer_zh = faq.answer_zh || ''
    form.category = faq.category || ''
  } else {
    editingFaq.value = null
    form.question_fr = ''
    form.question_en = ''
    form.question_zh = ''
    form.answer_fr = ''
    form.answer_en = ''
    form.answer_zh = ''
    form.category = ''
  }
  modalInstance?.show()
}

const saveFaq = async () => {
  const data = {
    question_fr: form.question_fr,
    question_en: form.question_en || null,
    question_zh: form.question_zh || null,
    answer_fr: form.answer_fr,
    answer_en: form.answer_en || null,
    answer_zh: form.answer_zh || null,
    category: form.category || null
  }

  try {
    if (editingFaq.value) {
      await blogStore.updateFAQ(editingFaq.value.id, data as any)
      success(t('admin.faq.updated'))
    } else {
      await blogStore.createFAQ(data as any)
      success(t('admin.faq.created'))
    }
    modalInstance?.hide()
    await fetchFAQ(blogStore.faqMeta.currentPage)
  } catch (err: any) {
    error(err.message || t('admin.messages.saveError'))
  }
}

const deleteFaq = async (id: number) => {
  if (confirm(t('admin.confirm.deleteQuestion'))) {
    await blogStore.deleteFAQ(id)
    success(t('admin.faq.deleted'))
    await fetchFAQ(blogStore.faqMeta.currentPage)
  }
}
</script>
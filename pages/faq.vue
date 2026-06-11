<template>
  <div>
    <ClientOnly>
      <NavbarDark />
    </ClientOnly>

    <section class="bg-light">
      <div class="container">
        <div class="row justify-content-start align-items-center">
          <div class="col-xl-7 col-lg-9 col-md-12 col-sm-12">
            <div class="position-relative pt-lg-0 pt-5">
              <h1 class="xl-heading">{{ t('faq.title') }}</h1>
              <nav id="breadcrumbs" class="breadcrumbs">
                <ul>
                  <li><NuxtLink to="/">{{ t('nav.home') }}</NuxtLink></li>
                  <li>{{ t('faq.title') }}</li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="container">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>

        <div v-else-if="faqsByCategory.length === 0" class="text-center py-5">
          <i class="bi bi-question-circle display-1 text-muted"></i>
          <p class="text-muted mt-3">{{ t('faq.noQuestions') }}</p>
        </div>

        <div v-else class="row align-items-start">
          <div class="col-xl-12 col-lg-12 col-md-12">
            <div class="d-flex align-items-start flex-column gap-3">
              <div
                v-for="(group, gIdx) in faqsByCategory"
                :key="group.category"
                class="faqsWraps w-100"
              >
                <div class="fasqHeads mb-2">
                  <h4 class="mb-0">{{ group.category }}</h4>
                </div>
                <div class="faqsCaps">
                  <div class="accordion accordion-flush" :id="`faqGroup${gIdx}`">
                    <div
                      v-for="(item, iIdx) in group.items"
                      :key="item.id"
                      class="accordion-item"
                    >
                      <h2 class="accordion-header rounded-2">
                        <button
                          class="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          :data-bs-target="`#faqItem${gIdx}_${iIdx}`"
                          aria-expanded="false"
                        >
                          {{ item[`question_${locale}`] || item.question_fr }}
                        </button>
                      </h2>
                      <div
                        :id="`faqItem${gIdx}_${iIdx}`"
                        class="accordion-collapse collapse"
                        :data-bs-parent="`#faqGroup${gIdx}`"
                      >
                        <div class="accordion-body" v-html="item[`answer_${locale}`] || item.answer_fr"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <FooterTop />
    <FooterOne />
    <BackToTop />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBlogStore } from '~/stores/blog'

const { t, locale } = useI18n()
const blogStore = useBlogStore()

const loading = ref(true)
const allFaqs = ref<any[]>([])

const faqsByCategory = computed(() => {
  const groups = new Map<string, any[]>()
  for (const f of allFaqs.value) {
    const cat = f.category || t('faq.general')
    if (!groups.has(cat)) groups.set(cat, [])
    groups.get(cat)!.push(f)
  }
  return Array.from(groups.entries()).map(([category, items]) => ({ category, items }))
})

onMounted(async () => {
  loading.value = true
  await blogStore.fetchFAQ({ page: 1, limit: 200 })
  allFaqs.value = blogStore.faq
  loading.value = false
})
</script>

<style lang="scss" scoped>
/* Espacement plus serré entre les questions d'un groupe FAQ */
.faqsWraps :deep(.accordion-item) {
  margin-bottom: 0.5rem;
}
.faqsWraps :deep(.accordion-item:last-child) {
  margin-bottom: 0;
}
</style>

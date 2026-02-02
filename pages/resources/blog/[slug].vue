<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="py-5 text-center">
      <div class="spinner-border text-primary"></div>
    </div>

    <!-- Not Found -->
    <div v-else-if="!post" class="py-5">
      <div class="container text-center">
        <i class="bi bi-journal-x display-1 text-muted"></i>
        <h3 class="mt-4">{{ t('blog.notFound') }}</h3>
        <p class="text-muted">{{ t('blog.notFoundDesc') }}</p>
        <NuxtLink to="/resources/blog" class="btn btn-primary">
          <i class="bi bi-arrow-left me-2"></i>{{ t('blog.backToBlog') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Article -->
    <template v-else>
      <!-- Hero -->
      <section class="blog-hero position-relative">
        <div class="hero-bg" :style="{ backgroundImage: `url(${post.image})` }"></div>
        <div class="container position-relative py-5">
          <div class="row justify-content-center">
            <div class="col-lg-8 text-center text-white">
              <div class="mb-3">
                <span class="badge bg-primary me-2">{{ post.category }}</span>
                <span class="opacity-75">{{ post.readTime }} {{ t('blog.readTime') }}</span>
              </div>
              <h1 class="display-5 fw-bold mb-4 text-white">{{ post.title }}</h1>
              <div class="d-flex justify-content-center align-items-center gap-4">
                <div class="d-flex align-items-center">
                  <img :src="post.authorAvatar" class="rounded-circle me-2" width="40" height="40" :alt="post.author" />
                  <span>{{ post.author }}</span>
                </div>
                <div>
                  <i class="bi bi-calendar3 me-1"></i>
                  {{ formatDate(post.publishedAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Content -->
      <section class="py-5">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-lg-8">
              <!-- Featured Image -->
              <div class="mb-5">
                <img :src="post.image" :alt="post.title" class="img-fluid rounded-4 shadow w-100" />
              </div>

              <!-- Article Content -->
              <article class="blog-content">
                <p class="lead text-muted">{{ post.excerpt }}</p>

                <hr class="my-4">

                <!-- Example Content -->
                <h2>{{ t('blog.introduction') }}</h2>
                <p>{{ t('blog.introText1') }}</p>
                <p>{{ t('blog.introText2') }}</p>

                <h2>{{ t('blog.advantagesTitle') }}</h2>
                <ul>
                  <li><strong>{{ t('blog.advantage1') }}</strong> {{ t('blog.advantage1Desc') }}</li>
                  <li><strong>{{ t('blog.advantage2') }}</strong> {{ t('blog.advantage2Desc') }}</li>
                  <li><strong>{{ t('blog.advantage3') }}</strong> {{ t('blog.advantage3Desc') }}</li>
                  <li><strong>{{ t('blog.advantage4') }}</strong> {{ t('blog.advantage4Desc') }}</li>
                </ul>

                <blockquote class="blockquote bg-light p-4 rounded my-4">
                  <p class="mb-0 fst-italic">"{{ t('blog.quote') }}"</p>
                  <footer class="blockquote-footer mt-2">{{ t('blog.quoteAuthor') }}</footer>
                </blockquote>

                <h2>{{ t('blog.stepsTitle') }}</h2>
                <ol>
                  <li class="mb-3">
                    <strong>{{ t('blog.stepIdentify') }}</strong> {{ t('blog.stepIdentifyDesc') }}
                  </li>
                  <li class="mb-3">
                    <strong>{{ t('blog.stepSupplier') }}</strong> {{ t('blog.stepSupplierDesc') }}
                  </li>
                  <li class="mb-3">
                    <strong>{{ t('blog.stepNegotiate') }}</strong> {{ t('blog.stepNegotiateDesc') }}
                  </li>
                  <li class="mb-3">
                    <strong>{{ t('blog.stepQuality') }}</strong> {{ t('blog.stepQualityDesc') }}
                  </li>
                  <li class="mb-3">
                    <strong>{{ t('blog.stepShipping') }}</strong> {{ t('blog.stepShippingDesc') }}
                  </li>
                </ol>

                <div class="alert alert-primary my-4">
                  <i class="bi bi-lightbulb me-2"></i>
                  <strong>{{ t('blog.tip') }}</strong> {{ t('blog.tipText') }}
                </div>

                <h2>{{ t('blog.conclusion') }}</h2>
                <p>{{ t('blog.conclusionText1') }}</p>
                <p>{{ t('blog.conclusionText2') }}</p>
              </article>

              <!-- Tags -->
              <div class="mt-5 pt-4 border-top">
                <h6 class="mb-3">{{ t('blog.tags') }}</h6>
                <div class="d-flex flex-wrap gap-2">
                  <span v-for="tag in post.tags" :key="tag" class="badge bg-light text-dark">
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- Share -->
              <div class="mt-4 pt-4 border-top">
                <h6 class="mb-3">{{ t('blog.shareArticle') }}</h6>
                <div class="d-flex gap-2">
                  <a href="#" class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-facebook"></i>
                  </a>
                  <a href="#" class="btn btn-outline-info btn-sm">
                    <i class="bi bi-twitter"></i>
                  </a>
                  <a href="#" class="btn btn-outline-success btn-sm">
                    <i class="bi bi-whatsapp"></i>
                  </a>
                  <a href="#" class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-linkedin"></i>
                  </a>
                </div>
              </div>

              <!-- CTA -->
              <div class="card bg-primary text-white mt-5">
                <div class="card-body p-4 p-lg-5 text-center">
                  <h4 class="fw-bold mb-3">{{ t('blog.ctaTitle') }}</h4>
                  <p class="opacity-75 mb-4">{{ t('blog.ctaDesc') }}</p>
                  <div class="d-flex justify-content-center gap-3 flex-wrap">
                    <NuxtLink to="/personal-shopping/new" class="btn btn-light">
                      {{ t('personalShopping.newRequest') }}
                    </NuxtLink>
                    <a :href="`https://wa.me/${useRuntimeConfig().public.whatsapp}`" target="_blank" class="btn btn-outline-light">
                      <i class="bi bi-whatsapp me-2"></i>{{ t('common.contactUs') }}
                    </a>
                  </div>
                </div>
              </div>

              <!-- Navigation -->
              <div class="d-flex justify-content-between mt-5 pt-4 border-top">
                <NuxtLink to="/resources/blog" class="btn btn-outline-secondary">
                  <i class="bi bi-arrow-left me-2"></i>{{ t('blog.backToBlog') }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBlogStore } from '~/stores/blog'
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({
  layout: 'default'
})

const { t } = useI18n()
const route = useRoute()
const blogStore = useBlogStore()
const { formatDate } = useFormatters()

const loading = ref(true)
const post = ref<any>(null)

onMounted(async () => {
  await blogStore.fetchPosts()
  const slug = route.params.slug as string
  post.value = blogStore.getPostBySlug(slug)
  loading.value = false
})
</script>

<style scoped>
.blog-hero {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  min-height: 400px;
  display: flex;
  align-items: center;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.2;
}

.blog-content {
  font-size: 1.1rem;
  line-height: 1.8;
}

.blog-content h2 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.blog-content ul,
.blog-content ol {
  margin-bottom: 1.5rem;
}

.blog-content li {
  margin-bottom: 0.5rem;
}

.blog-content p {
  margin-bottom: 1.5rem;
}
</style>

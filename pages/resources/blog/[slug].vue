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
        <div class="hero-bg" :style="{ backgroundImage: `url(${resolveImage(post.image)})` }"></div>
        <div class="container position-relative py-5">
          <div class="row justify-content-center">
            <div class="col-lg-8 text-center text-white">
              <div class="mb-3">
                <span v-if="post.category" class="badge bg-primary me-2">{{ post.category }}</span>
                <span v-if="post.read_time" class="opacity-75">{{ post.read_time }} {{ t('blog.readTime') }}</span>
              </div>
              <h1 class="display-5 fw-bold mb-4 text-white">{{ post[`title_${locale}`] || post.title_fr }}</h1>
              <div class="d-flex justify-content-center align-items-center gap-4 flex-wrap">
                <div v-if="post.author" class="d-flex align-items-center">
                  <img :src="resolveAvatar(post.author_avatar, post.author)" class="rounded-circle me-2" width="40" height="40" :alt="post.author" />
                  <span>{{ post.author }}</span>
                </div>
                <div v-if="post.published_at">
                  <i class="bi bi-calendar3 me-1"></i>
                  {{ formatDate(post.published_at) }}
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
              <div v-if="post.image" class="mb-5">
                <img :src="resolveImage(post.image)" :alt="post.title_fr || ''" class="img-fluid rounded-4 shadow w-100" />
              </div>

              <!-- Article Content -->
              <article class="blog-content">
                <p v-if="post[`excerpt_${locale}`] || post.excerpt_fr" class="lead text-muted">
                  {{ post[`excerpt_${locale}`] || post.excerpt_fr }}
                </p>

                <div v-html="enrichedBody"></div>
              </article>

              <!-- Tags -->
              <div v-if="post.tags && post.tags.length" class="mt-5 pt-4 border-top">
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
                  <a :href="shareUrl('facebook')" target="_blank" class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-facebook"></i>
                  </a>
                  <a :href="shareUrl('twitter')" target="_blank" class="btn btn-outline-info btn-sm">
                    <i class="bi bi-twitter"></i>
                  </a>
                  <a :href="shareUrl('whatsapp')" target="_blank" class="btn btn-outline-success btn-sm">
                    <i class="bi bi-whatsapp"></i>
                  </a>
                  <a :href="shareUrl('linkedin')" target="_blank" class="btn btn-outline-primary btn-sm">
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
import { ref, onMounted, computed } from 'vue'
import { useBlogStore } from '~/stores/blog'
import { useFormatters } from '~/composables/useFormatters'
import { enrichBlogBodyHtml } from '~/composables/useBlogBodyHtml'

definePageMeta({
  layout: 'default'
})

const { t, locale } = useI18n()
const route = useRoute()
const blogStore = useBlogStore()
const { formatDate } = useFormatters()
const config = useRuntimeConfig()

const loading = ref(true)
const post = ref<any>(null)

const enrichedBody = computed(() => {
  const p = post.value
  if (!p) return ''
  const raw = p[`content_${locale.value}`] || p.content_fr || ''
  return enrichBlogBodyHtml(String(raw))
})

const resolveImage = (img: string | null) => {
  if (!img) return 'https://placehold.co/1200x600?text=NADOM'
  return resolveStorageAssetUrl(img) || 'https://placehold.co/1200x600?text=NADOM'
}

const resolveAvatar = (avatar: string | null, name: string | null) => {
  if (avatar) return resolveStorageAssetUrl(avatar)
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Author')}&background=random&color=fff`
}

const shareUrl = (platform: string) => {
  const url = typeof window !== 'undefined' ? window.location.href : ''
  const title = post.value?.[`title_${locale.value}`] || post.value?.title_fr || ''
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)
  const map: Record<string, string> = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    twitter: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
    whatsapp: `https://wa.me/?text=${t}%20${u}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`
  }
  return map[platform] || '#'
}

onMounted(async () => {
  loading.value = true
  const slug = route.params.slug as string
  post.value = await blogStore.fetchPostBySlug(slug)
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

.blog-content :deep(h2) {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.blog-content :deep(ul),
.blog-content :deep(ol) {
  margin-bottom: 1.5rem;
}

.blog-content :deep(li) {
  margin-bottom: 0.5rem;
}

.blog-content :deep(p) {
  margin-bottom: 1.5rem;
}

.blog-content :deep(blockquote) {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 0.5rem;
  font-style: italic;
}

.blog-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
}

.blog-content :deep(.blog-video-wrapper) {
  display: block;
  position: relative;
  width: 100%;
  max-width: 100%;
  margin: 1.5rem 0;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: 0.5rem;
  background: #0f172a;
}

.blog-content :deep(.blog-video-wrapper .blog-video-iframe) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 0.5rem;
}

/* Vidéo insérée via l'éditeur (Quill) ou iframe YouTube directe */
.blog-content :deep(iframe.ql-video),
.blog-content :deep(iframe[src*="youtube.com"]) {
  width: 100%;
  aspect-ratio: 16 / 9;
  height: auto;
  min-height: 180px;
  max-height: 480px;
  border: 0;
  border-radius: 0.5rem;
  display: block;
  margin: 1.5rem auto;
}
</style>

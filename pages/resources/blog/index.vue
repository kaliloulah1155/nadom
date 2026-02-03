<template>
  <div>
    <!-- Hero -->
    <section class="hero-mini py-5 bg-primary text-white">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <h1 class="display-5 fw-bold mb-3 text-white text-center">{{ t('blog.title') }}</h1>
            <p class="lead opacity-75 mb-0 text-white text-center">
              {{ t('blog.subtitle') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Blog List -->
    <section class="py-5">
      <div class="container">
        <div class="row g-4">
          <div v-for="post in blogPosts" :key="post.id" class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 shadow-sm">
              <img
                :src="post.image"
                class="card-img-top"
                :alt="post.title_fr"
                style="height: 200px; object-fit: cover;"
              />
              <div class="card-body">
                <div class="d-flex gap-2 mb-2">
                  <span class="badge bg-primary-subtle text-primary">{{ post.category }}</span>
                  <small class="text-muted">{{ post.readTime }}</small>
                </div>
                <h5 class="card-title">{{ post[`title_${locale}`] || post.title_fr }}</h5>
                <p class="card-text text-muted small">{{ post[`excerpt_${locale}`] || post.excerpt_fr }}</p>
              </div>
              <div class="card-footer bg-transparent border-0">
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-muted">{{ formatDate(post.publishedAt) }}</small>
                  <NuxtLink :to="`/resources/blog/${post.slug}`" class="btn btn-sm btn-outline-primary">
                    {{ t('blog.readMore') }} <i class="bi bi-arrow-right ms-1"></i>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="blogPosts.length === 0" class="text-center py-5">
          <i class="bi bi-journal-text display-1 text-muted"></i>
          <p class="text-muted mt-3">{{ t('blog.noArticles') }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { FAKE_BLOG_POSTS } from '~/utils/data/fakeData'
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({
  layout: 'default'
})

const { t, locale } = useI18n()
const { formatDate } = useFormatters()

const blogPosts = FAKE_BLOG_POSTS
</script>

<style scoped>
.hero-mini {
  background: linear-gradient(135deg, var(--bs-primary) 0%, #1e40af 100%);
}
</style>

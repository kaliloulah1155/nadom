<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">{{ t('admin.blog.title') }}</h4>
        <p class="text-muted mb-0">{{ t('admin.blog.totalCount', { n: blogStore.postsMeta.total }) }}</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>{{ t('admin.blog.newArticle') }}
      </button>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-transparent border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input v-model="searchQuery" type="text" class="form-control border-start-0" :placeholder="t('admin.requests.searchPlaceholder')" @input="debouncedFetch" />
            </div>
          </div>
          <div class="col-md-3">
            <select v-model="isPublished" class="form-select" @change="fetchPosts(1)">
              <option :value="undefined">{{ t('admin.common.all') }}</option>
              <option :value="true">{{ t('admin.blog.published') }}</option>
              <option :value="false">{{ t('admin.blog.drafts') }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Articles Grid -->
    <div class="row g-4">
      <div v-for="post in posts" :key="post.id" class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm h-100">
          <img
            :src="post.image || 'https://placehold.co/400x200?text=No+Image'"
            :alt="post.title_fr"
            class="card-img-top"
            style="height: 160px; object-fit: cover;"
          />
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-primary">{{ post.category }}</span>
              <span :class="['badge', post.is_published ? 'bg-success' : 'bg-warning']">
                {{ post.is_published ? 'Publié' : 'Brouillon' }}
              </span>
            </div>
            <h6 class="card-title">{{ truncate(post.title_fr || post.title_en || '', 50) }}</h6>
            <p class="card-text small text-muted">{{ truncate(post.excerpt_fr || post.excerpt_en || '', 80) }}</p>
            <div class="d-flex gap-2">
              <span v-for="tag in (post.tags || []).slice(0, 2)" :key="tag" class="badge bg-light text-dark small">
                {{ tag }}
              </span>
            </div>
          </div>
          <div class="card-footer bg-transparent border-0">
            <div class="d-flex w-100">
              <button class="btn btn-sm btn-outline-primary me-2" @click="openModal(post)">
                <i class="bi bi-pencil"></i> {{ t('admin.common.edit') }}
              </button>
              <button class="btn btn-sm btn-outline-danger" :disabled="deletingId === post.id" @click="deletePost(post.id)">
                <span v-if="deletingId === post.id" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <i v-else class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="posts.length === 0" class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center py-5">
            <i class="bi bi-journal-x display-4 text-muted"></i>
            <h5 class="mt-3">{{ t('admin.blog.noArticles') }}</h5>
            <p class="text-muted">{{ t('admin.blog.createFirst') }}</p>
            <button class="btn btn-primary" @click="openModal()">
              <i class="bi bi-plus-lg me-2"></i>{{ t('admin.blog.createArticle') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="posts.length > 0" class="card border-0 shadow-sm mt-4">
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          v-model:current-page="blogStore.postsMeta.currentPage"
          v-model:limit="blogStore.postsMeta.perPage"
          :total-items="blogStore.postsMeta.total"
          @update:current-page="(p: number) => fetchPosts(p)"
          @update:limit="(l: number) => fetchPosts(1, l)"
        />
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="postModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingPost ? t('admin.blog.modalEdit') : t('admin.blog.modalNew') }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="savePost">
            <div class="modal-body">
              <ul class="nav nav-tabs mb-3">
                <li class="nav-item">
                  <button type="button" class="nav-link active" data-bs-toggle="tab" data-bs-target="#post-fr">{{ t('admin.common.french') }}</button>
                </li>
                <li class="nav-item">
                  <button type="button" class="nav-link" data-bs-toggle="tab" data-bs-target="#post-en">{{ t('admin.common.english') }}</button>
                </li>
                <li class="nav-item">
                  <button type="button" class="nav-link" data-bs-toggle="tab" data-bs-target="#post-zh">{{ t('admin.common.chinese') }}</button>
                </li>
              </ul>

              <div class="tab-content mb-3">
                <div class="tab-pane fade show active" id="post-fr">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label">Titre (FR) *</label>
                      <input v-model="form.title_fr" type="text" class="form-control" required />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Extrait (FR)</label>
                      <WysiwygEditor v-model="form.excerpt_fr" height="120px" />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Contenu (FR)</label>
                      <p class="small text-muted mb-2">
                        Collez une URL YouTube (page vidéo ou partager) ou utilisez le bouton « vidéo » de l'éditeur : la lecture s'affiche sur le site.
                      </p>
                      <WysiwygEditor v-model="form.content_fr" height="200px" />
                    </div>
                  </div>
                </div>
                <div class="tab-pane fade" id="post-en">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label">Title (EN) *</label>
                      <input v-model="form.title_en" type="text" class="form-control" />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Excerpt (EN)</label>
                      <WysiwygEditor v-model="form.excerpt_en" height="120px" />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Content (EN)</label>
                      <p class="small text-muted mb-2">
                        Paste a YouTube URL or use the editor video button; playback is embedded on the public article.
                      </p>
                      <WysiwygEditor v-model="form.content_en" height="200px" />
                    </div>
                  </div>
                </div>
                <div class="tab-pane fade" id="post-zh">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label">标题 (中文)</label>
                      <input v-model="form.title_zh" type="text" class="form-control" />
                    </div>
                    <div class="col-12">
                      <label class="form-label">摘要 (中文)</label>
                      <WysiwygEditor v-model="form.excerpt_zh" height="120px" />
                    </div>
                    <div class="col-12">
                      <label class="form-label">正文 (中文)</label>
                      <WysiwygEditor v-model="form.content_zh" height="200px" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Slug *</label>
                  <input v-model="form.slug" type="text" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Catégorie</label>
                  <input v-model="form.category" type="text" class="form-control" placeholder="Actualités" />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Temps de lecture (min)</label>
                  <input v-model.number="form.read_time" type="number" class="form-control" min="1" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Auteur</label>
                  <input v-model="form.author" type="text" class="form-control" />
                </div>

                <div class="col-12">
                  <label class="form-label">Image</label>
                  <div class="d-flex align-items-center gap-3">
                    <img
                      v-if="form.image"
                      :src="resolveImage(form.image)"
                      class="rounded border"
                      style="width:120px; height:80px; object-fit:cover;"
                    />
                    <div class="flex-grow-1">
                      <input
                        type="file"
                        class="form-control"
                        accept="image/*"
                        :disabled="uploading"
                        @change="onImageSelected"
                      />
                      <small v-if="uploading" class="text-muted">Téléversement…</small>
                      <small v-else-if="form.image" class="text-muted text-truncate d-block">{{ form.image }}</small>
                    </div>
                    <button
                      v-if="form.image"
                      type="button"
                      class="btn btn-sm btn-outline-danger"
                      @click="form.image = ''"
                    >
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>

                <div class="col-12">
                  <label class="form-label">Tags (séparés par virgule)</label>
                  <input v-model="form.tagsInput" type="text" class="form-control" placeholder="news, actualité, chine" />
                </div>

                <div class="col-12">
                  <div class="form-check">
                    <input v-model="form.is_published" type="checkbox" class="form-check-input" id="postPublished" />
                    <label class="form-check-label" for="postPublished">
                      Publié
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" :disabled="saving">{{ t('admin.common.cancel') }}</button>
              <button type="submit" class="btn btn-primary" :disabled="saving || uploading">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ t('admin.common.save') }}
              </button>
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
import { getToken } from '~/composables/useApi'

definePageMeta({
  layout: 'admin'
})

const blogStore = useBlogStore()
const { success, error } = useNotification()
const config = useRuntimeConfig()

const uploading = ref(false)

const resolveImage = (path: string) => {
  if (!path) return ''
  return resolveStorageAssetUrl(path)
}

const onImageSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('image', file)
    const token = getToken()
    const res = await fetch((config.public.apiBase as string).replace(/\/$/, '') + '/upload/image', {
      method: 'POST',
      headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: fd,
    })
    const json = await res.json()
    if (json?.status === 'success' && (json.data?.path || json.data?.url)) {
      form.image = json.data.path || json.data.url
      success(t('admin.messages.uploaded'))
    } else {
      throw new Error(json?.message || 'Échec du téléversement')
    }
  } catch (err: any) {
    error(err.message || t('admin.messages.uploadError'))
  } finally {
    uploading.value = false
    input.value = ''
  }
}

const posts = computed(() => blogStore.posts)

const searchQuery = ref('')
const isPublished = ref<boolean | undefined>(undefined)
const editingPost = ref<any>(null)
const saving = ref(false)
const deletingId = ref<number | string | null>(null)
const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null

const form = reactive({
  slug: '',
  title_fr: '',
  title_en: '',
  title_zh: '',
  excerpt_fr: '',
  excerpt_en: '',
  excerpt_zh: '',
  content_fr: '',
  content_en: '',
  content_zh: '',
  category: '',
  author: '',
  author_avatar: '',
  image: '',
  read_time: 5,
  tagsInput: '',
  is_published: false
})

const fetchPosts = async (page?: number, limit?: number) => {
  await blogStore.fetchPosts({
    page: page ?? blogStore.postsMeta.currentPage,
    limit: limit ?? blogStore.postsMeta.perPage,
    search: searchQuery.value || undefined,
    is_published: isPublished.value
  })
}

let debounceTimer: any = null
const debouncedFetch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchPosts(1), 400)
}

const truncate = (str: string, len: number) => {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}

const parseTags = (input: string): string[] => {
  return input.split(',').map(s => s.trim()).filter(s => s)
}

onMounted(async () => {
  await fetchPosts(1)
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const openModal = (post?: any) => {
  if (post) {
    editingPost.value = post
    form.slug = post.slug || ''
    form.title_fr = post.title_fr || ''
    form.title_en = post.title_en || ''
    form.title_zh = post.title_zh || ''
    form.excerpt_fr = post.excerpt_fr || ''
    form.excerpt_en = post.excerpt_en || ''
    form.excerpt_zh = post.excerpt_zh || ''
    form.content_fr = post.content_fr || ''
    form.content_en = post.content_en || ''
    form.content_zh = post.content_zh || ''
    form.category = post.category || ''
    form.author = post.author || ''
    form.author_avatar = post.author_avatar || ''
    form.image = post.image || ''
    form.read_time = post.read_time || 5
    form.tagsInput = (post.tags || []).join(', ')
    form.is_published = post.is_published ?? false
  } else {
    editingPost.value = null
    form.slug = ''
    form.title_fr = ''
    form.title_en = ''
    form.title_zh = ''
    form.excerpt_fr = ''
    form.excerpt_en = ''
    form.excerpt_zh = ''
    form.content_fr = ''
    form.content_en = ''
    form.content_zh = ''
    form.category = ''
    form.author = ''
    form.author_avatar = ''
    form.image = ''
    form.read_time = 5
    form.tagsInput = ''
    form.is_published = false
  }
  modalInstance?.show()
}

const savePost = async () => {
  if (saving.value) return
  saving.value = true
  const data = {
    slug: form.slug,
    title_fr: form.title_fr,
    title_en: form.title_en || null,
    title_zh: form.title_zh || null,
    excerpt_fr: form.excerpt_fr || null,
    excerpt_en: form.excerpt_en || null,
    excerpt_zh: form.excerpt_zh || null,
    content_fr: form.content_fr || null,
    content_en: form.content_en || null,
    content_zh: form.content_zh || null,
    category: form.category || null,
    author: form.author || null,
    author_avatar: form.author_avatar || null,
    image: form.image || null,
    read_time: form.read_time,
    tags: parseTags(form.tagsInput),
    is_published: form.is_published
  }

  try {
    if (editingPost.value) {
      await blogStore.updatePost(editingPost.value.id, data as any)
      success(t('admin.blog.updated'))
    } else {
      await blogStore.createPost(data as any)
      success(t('admin.blog.created'))
    }
    modalInstance?.hide()
    await fetchPosts(blogStore.postsMeta.currentPage)
  } catch (err: any) {
    error(err.message || t('admin.messages.saveError'))
  } finally {
    saving.value = false
  }
}

const deletePost = async (id: number) => {
  if (deletingId.value) return
  if (!confirm(t('admin.confirm.deleteArticle'))) return
  deletingId.value = id
  try {
    await blogStore.deletePost(id)
    success(t('admin.blog.deleted'))
    await fetchPosts(blogStore.postsMeta.currentPage)
  } catch (err: any) {
    error(err.message || t('admin.messages.deleteError'))
  } finally {
    deletingId.value = null
  }
}
</script>
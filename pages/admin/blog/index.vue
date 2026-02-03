<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Gestion du blog</h4>
        <p class="text-muted mb-0">{{ posts.length }} articles</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-lg me-2"></i>Nouvel article
      </button>
    </div>

    <!-- Articles Grid -->
    <div class="row g-4">
      <div v-for="post in paginatedPosts" :key="post.id" class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm h-100">
          <img
            :src="post.image"
            :alt="post.title_fr"
            class="card-img-top"
            style="height: 160px; object-fit: cover;"
          />
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-primary">{{ post.category }}</span>
              <small class="text-muted">{{ formatDateShort(post.publishedAt) }}</small>
            </div>
            <h6 class="card-title">{{ truncate(post.title_fr, 50) }}</h6>
            <p class="card-text small text-muted">{{ truncate(post.excerpt_fr, 80) }}</p>
            <div class="d-flex gap-2">
              <span v-for="tag in post.tags?.slice(0, 2)" :key="tag" class="badge bg-light text-dark small">
                {{ tag }}
              </span>
            </div>
          </div>
          <div class="card-footer bg-transparent border-0">
            <div class="d-flex w-100">
              <button class="btn btn-sm btn-outline-primary me-2" @click="openModal(post)">
                <i class="bi bi-pencil"></i> Modifier
              </button>
              <button class="btn btn-sm btn-outline-danger" @click="deletePost(post.id)">
                <i class="bi bi-trash"></i>
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
            <h5 class="mt-3">Aucun article</h5>
            <p class="text-muted">Commencez par creer votre premier article de blog.</p>
            <button class="btn btn-primary" @click="openModal()">
              <i class="bi bi-plus-lg me-2"></i>Creer un article
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="posts.length > 0" class="card border-0 shadow-sm mt-4">
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          v-model:current-page="currentPage"
          v-model:limit="perPage"
          :total-items="posts.length"
        />
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="postModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingPost ? 'Modifier' : 'Nouvel' }} article</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="savePost">
            <div class="modal-body">
              <!-- Tabs for Bilingual Support -->
              <ul class="nav nav-tabs mb-3" id="blogLangTabs" role="tablist">
                <li class="nav-item" role="presentation">
                  <button class="nav-link active" id="fr-tab" data-bs-toggle="tab" data-bs-target="#fr-content" type="button" role="tab">Français</button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" id="en-tab" data-bs-toggle="tab" data-bs-target="#en-content" type="button" role="tab">English</button>
                </li>
              </ul>

              <div class="tab-content" id="blogLangTabsContent">
                <!-- French Tab -->
                <div class="tab-pane fade show active" id="fr-content" role="tabpanel">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label">Titre de l'article (FR) *</label>
                      <input v-model="form.title_fr" type="text" class="form-control input-md" required />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Résumé (FR) *</label>
                      <textarea v-model="form.excerpt_fr" class="form-control" rows="2" required></textarea>
                    </div>
                    <div class="col-12">
                      <label class="form-label">Contenu (FR) *</label>
                      <WysiwygEditor v-model="form.content_fr" height="300px" />
                    </div>
                  </div>
                </div>

                <!-- English Tab -->
                <div class="tab-pane fade" id="en-content" role="tabpanel">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label">Title (EN) *</label>
                      <input v-model="form.title_en" type="text" class="form-control" placeholder="English title..." />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Excerpt (EN) *</label>
                      <textarea v-model="form.excerpt_en" class="form-control" rows="2" placeholder="English excerpt..."></textarea>
                    </div>
                    <div class="col-12">
                      <label class="form-label">Content (EN) *</label>
                      <WysiwygEditor v-model="form.content_en" height="300px" placeholder="English content..." />
                    </div>
                  </div>
                </div>
              </div>

              <hr class="my-4">

              <!-- Settings (Common) -->
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Catégorie *</label>
                  <select v-model="form.category" class="form-select" required>
                    <option value="">Sélectionnez</option>
                    <option value="Import-Export">Import-Export</option>
                    <option value="Conseils">Conseils</option>
                    <option value="Actualités">Actualités</option>
                    <option value="Tutoriels">Tutoriels</option>
                    <option value="Témoignages">Témoignages</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Temps de lecture (min)</label>
                  <input v-model.number="form.readTime" type="number" class="form-control input-md" min="1" />
                </div>
                <div class="col-12">
                  <label class="form-label">Image URL *</label>
                  <input v-model="form.image" type="url" class="form-control input-md" required placeholder="https://example.com/image.jpg" />
                  <div v-if="form.image" class="mt-2 text-center">
                    <img :src="form.image" class="img-thumbnail" style="max-height: 150px;" @error="(e: any) => e.target.style.display = 'none'" />
                  </div>
                </div>
                <div class="col-12">
                  <label class="form-label">Tags</label>
                  <input v-model="form.tagsInput" type="text" class="form-control input-md" placeholder="tag1, tag2, tag3" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Auteur</label>
                  <input v-model="form.author" type="text" class="form-control input-md" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Avatar auteur URL</label>
                  <input v-model="form.authorAvatar" type="url" class="form-control input-md" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-md me-2" data-bs-dismiss="modal">Annuler</button>
              <button type="submit" class="btn btn-primary btn-md" :disabled="blogStore.loading">
                <i v-if="blogStore.loading" class="spinner-border spinner-border-sm me-2"></i>
                <i v-else class="bi bi-check-lg me-2"></i>{{ editingPost ? 'Modifier' : 'Créer' }}
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
import { useBlogStore, type BlogPost } from '~/stores/blog'
import { useFormatters } from '~/composables/useFormatters'
import { useNotification } from '~/composables/useNotification'
import WysiwygEditor from '~/components/admin/WysiwygEditor.vue'

definePageMeta({
  layout: 'admin'
})

const blogStore = useBlogStore()
const { formatDateShort, truncate } = useFormatters()
const { success, error } = useNotification()

const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null

const editingPost = ref<BlogPost | null>(null)

const currentPage = ref(1)
const perPage = ref(6)

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return posts.value.slice(start, start + perPage.value)
})

const form = reactive({
  title_fr: '',
  title_en: '',
  category: '',
  image: '',
  excerpt_fr: '',
  excerpt_en: '',
  content_fr: '',
  content_en: '',
  readTime: 5,
  tagsInput: '',
  author: 'NADOM',
  authorAvatar: 'https://ui-avatars.com/api/?name=NADOM&background=0d6efd&color=fff'
})

onMounted(async () => {
  await blogStore.fetchPosts()

  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const posts = computed(() => blogStore.posts)

const resetForm = () => {
  form.title_fr = ''
  form.title_en = ''
  form.category = ''
  form.image = ''
  form.excerpt_fr = ''
  form.excerpt_en = ''
  form.content_fr = ''
  form.content_en = ''
  form.readTime = 5
  form.tagsInput = ''
  form.author = 'NADOM'
  form.authorAvatar = 'https://ui-avatars.com/api/?name=NADOM&background=0d6efd&color=fff'
}

const openModal = (post?: BlogPost) => {
  if (post) {
    editingPost.value = post
    form.title_fr = post.title_fr || ''
    form.title_en = post.title_en || ''
    form.category = post.category
    form.image = post.image
    form.excerpt_fr = post.excerpt_fr || ''
    form.excerpt_en = post.excerpt_en || ''
    form.content_fr = post.content_fr || ''
    form.content_en = post.content_en || ''
    form.readTime = post.readTime || 5
    form.tagsInput = post.tags?.join(', ') || ''
    form.author = post.author || 'NADOM'
    form.authorAvatar = post.authorAvatar || ''
  } else {
    editingPost.value = null
    resetForm()
  }
  modalInstance?.show()
}

const savePost = async () => {
  const tags = form.tagsInput.split(',').map(t => t.trim()).filter(Boolean)
  const slug = blogStore.generateSlug(form.title_fr)

  const postData: Partial<BlogPost> = {
    title_fr: form.title_fr,
    title_en: form.title_en,
    slug,
    category: form.category,
    image: form.image,
    excerpt_fr: form.excerpt_fr,
    excerpt_en: form.excerpt_en,
    content_fr: form.content_fr,
    content_en: form.content_en,
    readTime: form.readTime,
    tags,
    author: form.author,
    authorAvatar: form.authorAvatar
  }

  try {
    if (editingPost.value) {
      await blogStore.updatePost(editingPost.value.id, postData)
      success('Article modifié avec succès')
    } else {
      await blogStore.createPost(postData)
      success('Article créé avec succès')
    }
    modalInstance?.hide()
    resetForm()
  } catch (err) {
    error('Erreur lors de l\'enregistrement')
  }
}

const deletePost = async (id: string) => {
  if (!confirm('Supprimer cet article ?')) return

  try {
    await blogStore.deletePost(id)
    success('Article supprime')
  } catch (err) {
    error('Erreur lors de la suppression')
  }
}
</script>

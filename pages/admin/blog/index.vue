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
      <div v-for="post in posts" :key="post.id" class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm h-100">
          <img
            :src="post.image"
            :alt="post.title"
            class="card-img-top"
            style="height: 160px; object-fit: cover;"
          />
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-primary">{{ post.category }}</span>
              <small class="text-muted">{{ formatDateShort(post.publishedAt) }}</small>
            </div>
            <h6 class="card-title">{{ truncate(post.title, 50) }}</h6>
            <p class="card-text small text-muted">{{ truncate(post.excerpt, 80) }}</p>
            <div class="d-flex gap-2">
              <span v-for="tag in post.tags?.slice(0, 2)" :key="tag" class="badge bg-light text-dark small">
                {{ tag }}
              </span>
            </div>
          </div>
          <div class="card-footer bg-transparent border-0">
            <div class="btn-group w-100">
              <button class="btn btn-sm btn-outline-primary" @click="openModal(post)">
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
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Titre *</label>
                  <input v-model="form.title" type="text" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Categorie *</label>
                  <select v-model="form.category" class="form-select" required>
                    <option value="">Selectionnez</option>
                    <option value="Import-Export">Import-Export</option>
                    <option value="Conseils">Conseils</option>
                    <option value="Actualites">Actualites</option>
                    <option value="Tutoriels">Tutoriels</option>
                    <option value="Temoignages">Temoignages</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Temps de lecture (min)</label>
                  <input v-model.number="form.readTime" type="number" class="form-control" min="1" />
                </div>
                <div class="col-12">
                  <label class="form-label">Image URL *</label>
                  <input v-model="form.image" type="url" class="form-control" required />
                  <small class="text-muted">URL de l'image de couverture</small>
                </div>
                <div class="col-12">
                  <label class="form-label">Resume *</label>
                  <textarea v-model="form.excerpt" class="form-control" rows="2" required></textarea>
                </div>
                <div class="col-12">
                  <label class="form-label">Contenu *</label>
                  <textarea v-model="form.content" class="form-control" rows="8" required></textarea>
                  <small class="text-muted">Supporte le format Markdown</small>
                </div>
                <div class="col-12">
                  <label class="form-label">Tags</label>
                  <input v-model="form.tagsInput" type="text" class="form-control" placeholder="tag1, tag2, tag3" />
                  <small class="text-muted">Separes par des virgules</small>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Auteur</label>
                  <input v-model="form.author" type="text" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Avatar auteur URL</label>
                  <input v-model="form.authorAvatar" type="url" class="form-control" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
              <button type="submit" class="btn btn-primary">
                <i class="bi bi-check-lg me-2"></i>{{ editingPost ? 'Modifier' : 'Creer' }}
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
import { useBlogStore } from '~/stores/blog'
import { useFormatters } from '~/composables/useFormatters'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'admin'
})

const blogStore = useBlogStore()
const { formatDateShort, truncate } = useFormatters()
const { success, error } = useNotification()

const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null

const editingPost = ref<any>(null)

const form = reactive({
  title: '',
  category: '',
  image: '',
  excerpt: '',
  content: '',
  readTime: 5,
  tagsInput: '',
  author: 'NADOM',
  authorAvatar: 'https://ui-avatars.com/api/?name=NADOM&background=0d6efd&color=fff'
})

onMounted(async () => {
  await blogStore.fetchPosts()

  if (typeof window !== 'undefined' && window.bootstrap) {
    modalInstance = new window.bootstrap.Modal(modalRef.value)
  }
})

const posts = computed(() => blogStore.posts)

const resetForm = () => {
  form.title = ''
  form.category = ''
  form.image = ''
  form.excerpt = ''
  form.content = ''
  form.readTime = 5
  form.tagsInput = ''
  form.author = 'NADOM'
  form.authorAvatar = 'https://ui-avatars.com/api/?name=NADOM&background=0d6efd&color=fff'
}

const openModal = (post?: any) => {
  if (post) {
    editingPost.value = post
    form.title = post.title
    form.category = post.category
    form.image = post.image
    form.excerpt = post.excerpt
    form.content = post.content || ''
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
  const slug = form.title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  const postData = {
    title: form.title,
    slug,
    category: form.category,
    image: form.image,
    excerpt: form.excerpt,
    content: form.content,
    readTime: form.readTime,
    tags,
    author: form.author,
    authorAvatar: form.authorAvatar
  }

  try {
    if (editingPost.value) {
      await blogStore.updatePost(editingPost.value.id, postData)
      success('Article modifie')
    } else {
      await blogStore.createPost(postData)
      success('Article cree')
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

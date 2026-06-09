import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import { usePublicApi } from '~/composables/usePublicApi'

export interface BlogPost {
  id: number
  slug: string
  title_fr: string | null
  title_en: string | null
  excerpt_fr: string | null
  excerpt_en: string | null
  content_fr: string | null
  content_en: string | null
  category: string | null
  author: string | null
  author_avatar: string | null
  image: string | null
  read_time: number
  tags: string[] | null
  published_at: string | null
  is_published: boolean
  views?: number
  created_at?: string
  updated_at?: string
}

export interface FAQ {
  id: number
  question_fr: string | null
  question_en: string | null
  question_zh?: string | null
  answer_fr: string | null
  answer_en: string | null
  answer_zh?: string | null
  category: string | null
  position?: number
  // 1 = FAQ générale (/faq), 2 = FAQ affichée sur resources/pricing.
  statut?: number
  created_at?: string
  updated_at?: string
}

interface Meta {
  total: number
  currentPage: number
  perPage: number
  lastPage: number
}

const newMeta = (perPage = 15): Meta => ({ total: 0, currentPage: 1, perPage, lastPage: 1 })

interface BlogState {
  posts: BlogPost[]
  postsMeta: Meta
  faq: FAQ[]
  faqMeta: Meta
  loading: boolean
  error: string | null
}

function applyPaginator<T>(res: any, items: T[], meta: Meta) {
  const d = res.data
  if (d && typeof d === 'object' && Array.isArray(d.data)) {
    items.splice(0, items.length, ...d.data)
    meta.total = d.total ?? d.data.length
    meta.currentPage = d.current_page ?? meta.currentPage
    meta.perPage = d.per_page ?? meta.perPage
    meta.lastPage = d.last_page ?? 1
  } else if (Array.isArray(d)) {
    items.splice(0, items.length, ...d)
    meta.total = d.length
    meta.currentPage = 1
    meta.lastPage = 1
  } else {
    items.splice(0, items.length)
    meta.total = 0
    meta.lastPage = 1
  }
}

export const useBlogStore = defineStore('blog', {
  state: (): BlogState => ({
    posts: [],
    postsMeta: newMeta(6),
    faq: [],
    faqMeta: newMeta(10),
    loading: false,
    error: null
  }),

  getters: {
    getPostBySlug: (state) => (slug: string) => state.posts.find(p => p.slug === slug),
    getPostById: (state) => (id: string) => state.posts.find(p => p.id === id),
    getPostsByCategory: (state) => (category: string) => state.posts.filter(p => p.category === category),
    getRecentPosts: (state) => (limit: number = 5) =>
      [...state.posts].sort((a, b) => {
        const ta = new Date(b.published_at || b.created_at || 0).getTime()
        const tb = new Date(a.published_at || a.created_at || 0).getTime()
        return ta - tb
      }).slice(0, limit),
    getPopularPosts: (state) => (limit: number = 5) =>
      [...state.posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, limit),
    getAllCategories: (state) => Array.from(new Set(state.posts.map(p => p.category))),
    getFAQByCategory: (state) => (category: string) => state.faq.filter(f => f.category === category),
    getAllFAQCategories: (state) => Array.from(new Set(state.faq.map(f => f.category)))
  },

  actions: {
    async fetchPosts(params: {
      page?: number
      limit?: number
      search?: string
      category?: string
      is_published?: boolean
    } = {}) {
      this.loading = true
      this.error = null
      try {
        // Use PublicApi pour les endpoints publics (pas d'authentification requise)
        const api = usePublicApi()
        const hasPaging = params.page !== undefined || params.limit !== undefined || params.search || params.category || params.is_published !== undefined
        if (hasPaging) {
          const page = params.page ?? this.postsMeta.currentPage
          const limit = params.limit ?? this.postsMeta.perPage
          const body: Record<string, any> = { page, limit }
          if (params.search) body.search = params.search
          if (params.category) body.category = params.category
          if (params.is_published !== undefined) body.is_published = params.is_published
          const res = await api.post<any>('/blog-posts/all', body, { query: { page, limit } })
          if (res.success) {
            applyPaginator(res, this.posts, this.postsMeta)
          } else {
            this.error = res.message
          }
        } else {
          const res = await api.get<BlogPost[]>('/blog-posts/all')
          if (res.success) {
            this.posts = res.data || []
            this.postsMeta.total = this.posts.length
            this.postsMeta.lastPage = 1
            this.postsMeta.currentPage = 1
          } else {
            this.error = res.message
          }
        }
      } catch (err: any) {
        this.error = err.message || 'Erreur lors du chargement des articles'
      } finally {
        this.loading = false
      }
    },

    async fetchFAQ(params: { page?: number; limit?: number } = {}) {
      try {
        const api = useApi()
        const res = await api.get<FAQ[]>('/faq/all')
        if (res.success) {
          const all = res.data || []
          const page = params.page ?? this.faqMeta.currentPage
          const limit = params.limit ?? this.faqMeta.perPage
          const total = all.length
          const lastPage = Math.max(1, Math.ceil(total / limit))
          const safePage = Math.min(Math.max(1, page), lastPage)
          const start = (safePage - 1) * limit
          this.faq = all.slice(start, start + limit)
          this.faqMeta.total = total
          this.faqMeta.currentPage = safePage
          this.faqMeta.perPage = limit
          this.faqMeta.lastPage = lastPage
        }
      } catch (err: any) {
        this.error = err.message
      }
    },

    /** FAQ d'un statut donné (ex. statut=2 → page resources/pricing), triées par position. */
    async fetchFAQByStatut(statut: number): Promise<FAQ[]> {
      try {
        const api = useApi()
        const res = await api.get<FAQ[]>(`/faq/all?statut=${statut}`)
        return res.success ? (res.data || []) : []
      } catch (err: any) {
        this.error = err.message
        return []
      }
    },

    async fetchPostBySlug(slug: string): Promise<BlogPost | null> {
      try {
        const api = useApi()
        const res = await api.get<BlogPost>(`/blog-posts/${slug}`)
        if (res.success && res.data) {
          const idx = this.posts.findIndex(p => p.id === res.data!.id)
          if (idx === -1) this.posts.unshift(res.data)
          else this.posts[idx] = res.data
          return res.data
        }
      } catch (err: any) {
        this.error = err.message
      }
      return null
    },

    async incrementViews(id: string) {
      const post = this.posts.find(p => p.id === id)
      if (post) post.views = (post.views || 0) + 1
    },

    async createPost(postData: Partial<BlogPost>) {
      this.loading = true
      try {
        const api = useApi()
        const res = await api.post<BlogPost>('/blog-posts', postData)
        if (res.success && res.data) {
          this.posts.unshift(res.data)
          this.postsMeta.total++
          return res.data
        }
        throw new Error(res.message)
      } finally {
        this.loading = false
      }
    },

    async updatePost(id: number, updates: Partial<BlogPost>) {
      const api = useApi()
      const res = await api.put<BlogPost>(`/blog-posts/${id}`, updates)
      if (res.success && res.data) {
        const idx = this.posts.findIndex(p => p.id === id)
        if (idx !== -1) this.posts[idx] = res.data
        return res.data
      }
      return null
    },

    async deletePost(id: number) {
      const api = useApi()
      const res = await api.delete(`/blog-posts/${id}`)
      if (res.success) {
        this.posts = this.posts.filter(p => p.id !== id)
        this.postsMeta.total = Math.max(0, this.postsMeta.total - 1)
        return true
      }
      throw new Error(res.message)
    },

    generateSlug(title: string): string {
      return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    },

    async createFAQ(faqData: Partial<FAQ>) {
      const api = useApi()
      const res = await api.post<FAQ>('/faq', faqData)
      if (res.success && res.data) {
        this.faq.push(res.data)
        this.faqMeta.total++
        return res.data
      }
      throw new Error(res.message)
    },

    async updateFAQ(id: number, updates: Partial<FAQ>) {
      const api = useApi()
      const res = await api.put<FAQ>(`/faq/${id}`, updates)
      if (res.success && res.data) {
        const idx = this.faq.findIndex(f => f.id === id)
        if (idx !== -1) this.faq[idx] = res.data
        return res.data
      }
      return null
    },

    async deleteFAQ(id: number) {
      const api = useApi()
      const res = await api.delete(`/faq/${id}`)
      if (res.success) {
        this.faq = this.faq.filter(f => f.id !== id)
        this.faqMeta.total = Math.max(0, this.faqMeta.total - 1)
        return true
      }
      throw new Error(res.message)
    }
  }
})

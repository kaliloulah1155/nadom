import { defineStore } from 'pinia'
import { FAKE_BLOG_POSTS, FAKE_FAQ } from '~/utils/data/fakeData'

export interface BlogPost {
  id: string
  title_fr: string
  title_en: string
  slug: string
  excerpt_fr: string
  excerpt_en: string
  content_fr: string
  content_en: string
  category: string
  author: string
  authorAvatar: string
  image: string
  publishedAt: string
  views: number
  readTime: number
  tags?: string[]
}

export interface FAQ {
  id: string
  question_fr: string
  question_en: string
  answer_fr: string
  answer_en: string
  category: string
}

interface BlogState {
  posts: BlogPost[]
  faq: FAQ[]
  loading: boolean
  error: string | null
}

export const useBlogStore = defineStore('blog', {
  state: (): BlogState => ({
    posts: [],
    faq: [],
    loading: false,
    error: null
  }),

  getters: {
    getPostBySlug: (state) => (slug: string) => {
      return state.posts.find(p => p.slug === slug)
    },

    getPostById: (state) => (id: string) => {
      return state.posts.find(p => p.id === id)
    },

    getPostsByCategory: (state) => (category: string) => {
      return state.posts.filter(p => p.category === category)
    },

    getRecentPosts: (state) => (limit: number = 5) => {
      return [...state.posts]
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, limit)
    },

    getPopularPosts: (state) => (limit: number = 5) => {
      return [...state.posts]
        .sort((a, b) => b.views - a.views)
        .slice(0, limit)
    },

    getAllCategories: (state) => {
      const categories = new Set(state.posts.map(p => p.category))
      return Array.from(categories)
    },

    getFAQByCategory: (state) => (category: string) => {
      return state.faq.filter(f => f.category === category)
    },

    getAllFAQCategories: (state) => {
      const categories = new Set(state.faq.map(f => f.category))
      return Array.from(categories)
    }
  },

  actions: {
    async fetchPosts() {
      this.loading = true
      this.error = null

      try {
        await new Promise(resolve => setTimeout(resolve, 300))

        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('blogPosts')
          this.posts = saved ? JSON.parse(saved) : [...FAKE_BLOG_POSTS]
        } else {
          this.posts = [...FAKE_BLOG_POSTS]
        }
      } catch (err) {
        this.error = 'Erreur lors du chargement des articles'
      } finally {
        this.loading = false
      }
    },

    async fetchFAQ() {
      this.faq = [...FAKE_FAQ]
    },

    async incrementViews(id: string) {
      const post = this.posts.find(p => p.id === id)
      if (post) {
        post.views++
        this.savePostsToLocalStorage()
      }
    },

    async createPost(postData: Partial<BlogPost>) {
      this.loading = true

      try {
        await new Promise(resolve => setTimeout(resolve, 500))

        const newPost: BlogPost = {
          id: `blog_${Date.now()}`,
          title_fr: postData.title_fr || '',
          title_en: postData.title_en || '',
          slug: postData.slug || this.generateSlug(postData.title_fr || ''),
          excerpt_fr: postData.excerpt_fr || '',
          excerpt_en: postData.excerpt_en || '',
          content_fr: postData.content_fr || '',
          content_en: postData.content_en || '',
          category: postData.category || '',
          author: postData.author || '',
          authorAvatar: postData.authorAvatar || '',
          image: postData.image || '',
          publishedAt: new Date().toISOString().split('T')[0],
          views: 0,
          readTime: postData.readTime || 5
        }

        this.posts.unshift(newPost)
        this.savePostsToLocalStorage()

        return newPost
      } finally {
        this.loading = false
      }
    },

    async updatePost(id: string, updates: Partial<BlogPost>) {
      const idx = this.posts.findIndex(p => p.id === id)
      if (idx !== -1) {
        this.posts[idx] = { ...this.posts[idx], ...updates }
        this.savePostsToLocalStorage()
        return this.posts[idx]
      }
      return null
    },

    async deletePost(id: string) {
      this.posts = this.posts.filter(p => p.id !== id)
      this.savePostsToLocalStorage()
    },

    generateSlug(title: string): string {
      return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    },

    savePostsToLocalStorage() {
      if (typeof window !== 'undefined') {
        localStorage.setItem('blogPosts', JSON.stringify(this.posts))
      }
    },

    // FAQ Management
    async createFAQ(faqData: Partial<FAQ>) {
      const newFAQ: FAQ = {
        id: `faq_${Date.now()}`,
        question_fr: faqData.question_fr || '',
        question_en: faqData.question_en || '',
        answer_fr: faqData.answer_fr || '',
        answer_en: faqData.answer_en || '',
        category: faqData.category || ''
      }

      this.faq.push(newFAQ)
      this.saveFAQToLocalStorage()
      return newFAQ
    },

    async updateFAQ(id: string, updates: Partial<FAQ>) {
      const idx = this.faq.findIndex(f => f.id === id)
      if (idx !== -1) {
        this.faq[idx] = { ...this.faq[idx], ...updates }
        this.saveFAQToLocalStorage()
        return this.faq[idx]
      }
      return null
    },

    async deleteFAQ(id: string) {
      this.faq = this.faq.filter(f => f.id !== id)
      this.saveFAQToLocalStorage()
    },

    saveFAQToLocalStorage() {
      if (typeof window !== 'undefined') {
        localStorage.setItem('faq', JSON.stringify(this.faq))
      }
    }
  }
})

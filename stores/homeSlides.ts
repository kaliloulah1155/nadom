import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import { usePublicApi } from '~/composables/usePublicApi'

export interface HomeSlideRow {
  id: string
  image_path: string | null
  title_fr: string | null
  title_en: string | null
  title_zh: string | null
  subtitle_fr: string | null
  subtitle_en: string | null
  subtitle_zh: string | null
  cta_label_fr: string | null
  cta_label_en: string | null
  cta_label_zh: string | null
  cta_url: string | null
  display_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

interface HomeSlidesState {
  publicItems: HomeSlideRow[]
  adminItems: HomeSlideRow[]
  loading: boolean
  publicFetched: boolean
  publicFetchFailed: boolean
}

export const useHomeSlidesStore = defineStore('homeSlides', {
  state: (): HomeSlidesState => ({
    publicItems: [],
    adminItems: [],
    loading: false,
    publicFetched: false,
    publicFetchFailed: false
  }),

  actions: {
    async fetchPublic(): Promise<void> {
      const api = usePublicApi()
      const res = await api.get<HomeSlideRow[]>('/home-slides/public')
      this.publicFetched = true
      if (res.success && Array.isArray(res.data)) {
        this.publicItems = res.data
        this.publicFetchFailed = false
      } else {
        this.publicItems = []
        this.publicFetchFailed = true
      }
    },

    async fetchAdmin(): Promise<void> {
      this.loading = true
      try {
        const api = useApi()
        const res = await api.get<HomeSlideRow[]>('/home-slides/admin/all')
        this.adminItems = res.success && Array.isArray(res.data) ? res.data : []
      } finally {
        this.loading = false
      }
    },

    async create(payload: Partial<HomeSlideRow>) {
      const api = useApi()
      const res = await api.post<HomeSlideRow>('/home-slides', payload)
      if (res.success && res.data) {
        this.adminItems.push(res.data)
        return res.data
      }
      throw new Error(res.message || 'Erreur création')
    },

    async update(id: string, payload: Partial<HomeSlideRow>) {
      const api = useApi()
      const res = await api.put<HomeSlideRow>(`/home-slides/${id}`, payload)
      if (res.success && res.data) {
        const idx = this.adminItems.findIndex(r => r.id === id)
        if (idx !== -1) this.adminItems[idx] = res.data
        return res.data
      }
      throw new Error(res.message || 'Erreur mise à jour')
    },

    async remove(id: string) {
      const api = useApi()
      const res = await api.delete(`/home-slides/${id}`)
      if (res.success) {
        this.adminItems = this.adminItems.filter(r => r.id !== id)
        return true
      }
      throw new Error(res.message || 'Erreur suppression')
    }
  }
})

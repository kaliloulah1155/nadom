import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import { usePublicApi } from '~/composables/usePublicApi'

export interface GuideAccompanimentServiceRow {
  id: string
  slug: string
  icon: string | null
  title_fr: string | null
  title_en: string | null
  title_zh: string | null
  description_fr: string | null
  description_en: string | null
  description_zh: string | null
  features_fr: string[] | null
  features_en: string[] | null
  features_zh: string[] | null
  display_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

interface State {
  publicItems: GuideAccompanimentServiceRow[]
  adminItems: GuideAccompanimentServiceRow[]
  loading: boolean
  publicFetched: boolean
  publicFetchFailed: boolean
}

export const useGuideAccompanimentServicesStore = defineStore('guideAccompanimentServices', {
  state: (): State => ({
    publicItems: [],
    adminItems: [],
    loading: false,
    publicFetched: false,
    publicFetchFailed: false
  }),

  actions: {
    async fetchPublic(): Promise<void> {
      const api = usePublicApi()
      const res = await api.get<GuideAccompanimentServiceRow[]>('/guide-accompaniment-services/public')
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
        const res = await api.get<GuideAccompanimentServiceRow[]>('/guide-accompaniment-services/admin/all')
        let payload: unknown = res.data
        if (!Array.isArray(payload) && payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
          payload = (payload as { data: GuideAccompanimentServiceRow[] }).data
        }
        if (res.success && Array.isArray(payload)) {
          this.adminItems = payload
        } else {
          this.adminItems = []
        }
      } finally {
        this.loading = false
      }
    },

    async create(payload: Partial<GuideAccompanimentServiceRow> & { slug: string }) {
      const api = useApi()
      const res = await api.post<GuideAccompanimentServiceRow>('/guide-accompaniment-services', payload)
      if (res.success && res.data) {
        this.adminItems.push(res.data)
        return res.data
      }
      throw new Error(res.message || 'Erreur création')
    },

    async update(id: string, payload: Partial<GuideAccompanimentServiceRow>) {
      const api = useApi()
      const res = await api.put<GuideAccompanimentServiceRow>(`/guide-accompaniment-services/${id}`, payload)
      if (res.success && res.data) {
        const idx = this.adminItems.findIndex(r => r.id === id)
        if (idx !== -1) this.adminItems[idx] = res.data
        return res.data
      }
      throw new Error(res.message || 'Erreur mise à jour')
    },

    async remove(id: string) {
      const api = useApi()
      const res = await api.delete(`/guide-accompaniment-services/${id}`)
      if (res.success) {
        this.adminItems = this.adminItems.filter(r => r.id !== id)
        return true
      }
      throw new Error(res.message || 'Erreur suppression')
    }
  }
})

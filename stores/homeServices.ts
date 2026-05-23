import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import { usePublicApi } from '~/composables/usePublicApi'

export interface HomeServiceRow {
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

interface HomeServicesState {
  publicItems: HomeServiceRow[]
  adminItems: HomeServiceRow[]
  loading: boolean
  /** Terminé au moins un appel public (pour l’accueil). */
  publicFetched: boolean
  /** true si l’API est injoignable ou renvoie une erreur — on retombe sur les textes i18n. */
  publicFetchFailed: boolean
}

export const useHomeServicesStore = defineStore('homeServices', {
  state: (): HomeServicesState => ({
    publicItems: [],
    adminItems: [],
    loading: false,
    publicFetched: false,
    publicFetchFailed: false
  }),

  actions: {
    async fetchPublic(): Promise<void> {
      const api = usePublicApi()
      const res = await api.get<HomeServiceRow[]>('/home-services/public')
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
        const res = await api.get<HomeServiceRow[]>('/home-services/admin/all')
        if (res.success && Array.isArray(res.data)) {
          this.adminItems = res.data
        } else {
          this.adminItems = []
        }
      } finally {
        this.loading = false
      }
    },

    async create(payload: Partial<HomeServiceRow> & { slug: string }) {
      const api = useApi()
      const res = await api.post<HomeServiceRow>('/home-services', payload)
      if (res.success && res.data) {
        this.adminItems.push(res.data)
        return res.data
      }
      throw new Error(res.message || 'Erreur création')
    },

    async update(id: string, payload: Partial<HomeServiceRow>) {
      const api = useApi()
      const res = await api.put<HomeServiceRow>(`/home-services/${id}`, payload)
      if (res.success && res.data) {
        const idx = this.adminItems.findIndex(r => r.id === id)
        if (idx !== -1) this.adminItems[idx] = res.data
        return res.data
      }
      throw new Error(res.message || 'Erreur mise à jour')
    },

    async remove(id: string) {
      const api = useApi()
      const res = await api.delete(`/home-services/${id}`)
      if (res.success) {
        this.adminItems = this.adminItems.filter(r => r.id !== id)
        return true
      }
      throw new Error(res.message || 'Erreur suppression')
    }
  }
})

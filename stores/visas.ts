import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export interface Visa {
  id: number
  type: string
  name_fr: string | null
  name_en: string | null
  duration_fr: string | null
  duration_en: string | null
  validity_fr: string | null
  validity_en: string | null
  processing_time_fr: string | null
  processing_time_en: string | null
  cost: number | null
  currency: string | null
  requirements_fr: string[] | null
  requirements_en: string[] | null
  description_fr: string | null
  description_en: string | null
  pdf_url: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface VisaApplication {
  id: number
  visa_type_id: number
  user_id: number
  status: 'pending' | 'processing' | 'approved' | 'rejected'
  applicant_firstname: string
  applicant_lastname: string
  applicant_email: string
  applicant_phone: string
  applicant_nationality: string
  passport_number: string
  passport_expiry: string
  departure_date: string
  return_date: string | null
  documents: string[]
  notes: string | null
  total_cost: number
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

interface VisasState {
  visaTypes: Visa[]
  visaTypesMeta: Meta
  applications: VisaApplication[]
  applicationsMeta: Meta
  loading: boolean
  error: string | null
}

export const useVisasStore = defineStore('visas', {
  state: (): VisasState => ({
    visaTypes: [],
    visaTypesMeta: newMeta(6),
    applications: [],
    applicationsMeta: newMeta(15),
    loading: false,
    error: null
  }),

  getters: {
    getVisaByType: (state) => (type: string) => state.visaTypes.find(v => v.type === type),
    getVisaById: (state) => (id: number) => state.visaTypes.find(v => v.id === id),
    getApplicationsByUser: (state) => (userId: number) => state.applications.filter(a => a.user_id === userId),
    getApplicationsByStatus: (state) => (status: VisaApplication['status']) => state.applications.filter(a => a.status === status),
    getPendingApplications: (state) => state.applications.filter(a => a.status === 'pending' || a.status === 'processing')
  },

  actions: {
    async fetchVisaTypes(params: { page?: number; limit?: number } = {}) {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const res = await api.get<Visa[]>('/visa-types/all')
        if (res.success) {
          const all = res.data || []
          const hasPaging = params.page !== undefined || params.limit !== undefined
          if (hasPaging) {
            const page = params.page ?? this.visaTypesMeta.currentPage
            const limit = params.limit ?? this.visaTypesMeta.perPage
            const total = all.length
            const lastPage = Math.max(1, Math.ceil(total / limit))
            const safePage = Math.min(Math.max(1, page), lastPage)
            const start = (safePage - 1) * limit
            this.visaTypes = all.slice(start, start + limit)
            this.visaTypesMeta.total = total
            this.visaTypesMeta.currentPage = safePage
            this.visaTypesMeta.perPage = limit
            this.visaTypesMeta.lastPage = lastPage
          } else {
            this.visaTypes = all
            this.visaTypesMeta.total = all.length
            this.visaTypesMeta.currentPage = 1
            this.visaTypesMeta.lastPage = 1
          }
        } else {
          this.error = res.message
        }
      } catch (err: any) {
        this.error = err.message || 'Erreur lors du chargement des types de visa'
      } finally {
        this.loading = false
      }
    },

    async fetchApplications(params: { page?: number; limit?: number } = {}) {
      try {
        const api = useApi()
        const res = await api.get<VisaApplication[]>('/visa-applications')
        if (res.success) {
          const all = res.data || []
          const page = params.page ?? this.applicationsMeta.currentPage
          const limit = params.limit ?? this.applicationsMeta.perPage
          const total = all.length
          const lastPage = Math.max(1, Math.ceil(total / limit))
          const safePage = Math.min(Math.max(1, page), lastPage)
          const start = (safePage - 1) * limit
          this.applications = all.slice(start, start + limit)
          this.applicationsMeta.total = total
          this.applicationsMeta.currentPage = safePage
          this.applicationsMeta.perPage = limit
          this.applicationsMeta.lastPage = lastPage
        }
      } catch (err: any) {
        this.error = err.message
      }
    },

    async fetchMyApplications() {
      this.loading = true
      try {
        const api = useApi()
        const res = await api.get<any>('/visa-applications/mine')
        if (res.success) {
          // L'endpoint renvoie désormais un paginateur (il retournait auparavant
          // toutes les demandes d'un coup). On accepte les deux formes : sans cela
          // `applications` recevait l'objet paginateur au lieu du tableau, et le
          // compteur du tableau de bord comme la liste des visas se vidaient.
          const d: any = res.data
          this.applications = Array.isArray(d) ? d : (d?.data ?? [])
        }
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async createApplication(applicationData: Partial<VisaApplication>) {
      this.loading = true
      try {
        const api = useApi()
        const res = await api.post<VisaApplication>('/visa-applications', applicationData)
        if (res.success && res.data) {
          this.applications.unshift(res.data)
          this.applicationsMeta.total++
          return res.data
        }
        throw new Error(res.message)
      } finally {
        this.loading = false
      }
    },

    async updateApplicationStatus(id: number, status: VisaApplication['status'], notes?: string) {
      const api = useApi()
      const res = await api.put<VisaApplication>(`/visa-applications/${id}/status`, { status, notes })
      if (res.success && res.data) {
        const idx = this.applications.findIndex(a => a.id === id)
        if (idx !== -1) this.applications[idx] = res.data
        return res.data
      }
      return null
    },

    async createVisaType(visaData: Partial<Visa>) {
      const api = useApi()
      const res = await api.post<Visa>('/visa-types', visaData)
      if (res.success && res.data) {
        await this.fetchVisaTypes({ page: this.visaTypesMeta.currentPage, limit: this.visaTypesMeta.perPage })
        return res.data
      }
      throw new Error(res.message)
    },

    async updateVisaType(id: number, visaData: Partial<Visa>) {
      const api = useApi()
      const res = await api.put<Visa>(`/visa-types/${id}`, visaData)
      if (res.success && res.data) {
        await this.fetchVisaTypes({ page: this.visaTypesMeta.currentPage, limit: this.visaTypesMeta.perPage })
        return res.data
      }
      throw new Error(res.message)
    },

    async deleteVisaType(id: number) {
      const api = useApi()
      const res = await api.delete(`/visa-types/${id}`)
      if (res.success) {
        await this.fetchVisaTypes({ page: this.visaTypesMeta.currentPage, limit: this.visaTypesMeta.perPage })
        return true
      }
      throw new Error(res.message)
    }
  }
})

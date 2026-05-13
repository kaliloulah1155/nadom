import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export interface Guide {
  id: string
  name: string
  kind?: 'tour' | 'documentation'
  category_id?: number | null
  category?: { id: number; label: string | null; code: string | null; slug: string | null; icon: string | null }
  document_url?: string | null
  languages: string[]
  specializations_fr: string[]
  specializations_en: string[]
  cities: string[]
  experience: number
  rating: number
  reviews: number
  avatar: string | null
  price_per_day: number | null
  price_per_hour: number | null
  currency?: string | null
  description_fr: string | null
  description_en: string | null
  available: boolean
  created_at?: string
  updated_at?: string
}

export interface GuideBooking {
  id: string
  guide_id: string
  documentation_category_id?: number | null
  user_id: number
  start_date: string
  end_date: string
  service_type: 'hourly' | 'daily'
  hours?: number
  days?: number
  total_price: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  people_count?: number
  created_at?: string
  guide?: { id: string; name?: string | null; currency?: string | null }
  user?: { id: number; email?: string | null; firstname?: string | null; lastname?: string | null }
  documentation_category?: { id: number; label?: string | null; slug?: string | null } | null
}

interface Meta {
  total: number
  currentPage: number
  perPage: number
  lastPage: number
}

const newMeta = (perPage = 15): Meta => ({ total: 0, currentPage: 1, perPage, lastPage: 1 })

interface GuidesState {
  guides: Guide[]
  guidesMeta: Meta
  bookings: GuideBooking[]
  bookingsMeta: Meta
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

export const useGuidesStore = defineStore('guides', {
  state: (): GuidesState => ({
    guides: [],
    guidesMeta: newMeta(15),
    bookings: [],
    bookingsMeta: newMeta(15),
    loading: false,
    error: null
  }),

  getters: {
    getGuideById: (state) => (id: string) => state.guides.find(g => g.id === id),
    getAvailableGuides: (state) => state.guides.filter(g => g.available),
    getGuidesByCity: (state) => (city: string) => state.guides.filter(g => g.cities?.includes(city)),
    getGuidesByLanguage: (state) => (language: string) => state.guides.filter(g => g.languages?.includes(language)),
    getGuidesBySpecialization: (state) => (spec: string) =>
      state.guides.filter(g => g.specializations_fr?.includes(spec) || g.specializations_en?.includes(spec)),
    getBookingsByUser: (state) => (userId: string) => state.bookings.filter(b => b.userId === userId),
    getBookingsByGuide: (state) => (guideId: string) => state.bookings.filter(b => b.guideId === guideId),
    allCities: (state) => {
      const cities = new Set<string>()
      state.guides.forEach(g => g.cities?.forEach(c => cities.add(c)))
      return Array.from(cities)
    },
    allLanguages: (state) => {
      const langs = new Set<string>()
      state.guides.forEach(g => g.languages?.forEach(l => langs.add(l)))
      return Array.from(langs)
    },
    allSpecializations: (state) => {
      const specs = new Set<string>()
      state.guides.forEach(g => {
        g.specializations_fr?.forEach(s => specs.add(s))
        g.specializations_en?.forEach(s => specs.add(s))
      })
      return Array.from(specs)
    }
  },

  actions: {
    async fetchGuides(params: {
      page?: number
      limit?: number
      city?: string
      language?: string
      available?: boolean
      kind?: string
      category_id?: number
    } = {}) {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const hasPaging =
          params.page !== undefined ||
          params.limit !== undefined ||
          params.city ||
          params.language ||
          params.available !== undefined ||
          params.kind ||
          params.category_id !== undefined
        if (hasPaging) {
          const page = params.page ?? this.guidesMeta.currentPage
          const limit = params.limit ?? this.guidesMeta.perPage
          const body: Record<string, any> = { page, limit }
          if (params.city) body.city = params.city
          if (params.language) body.language = params.language
          if (params.available !== undefined) body.available = params.available
          if (params.kind) body.kind = params.kind
          if (params.category_id !== undefined) body.category_id = params.category_id
          const res = await api.post<any>('/guides/all', body, { query: { page, limit } })
          if (res.success) {
            applyPaginator(res, this.guides, this.guidesMeta)
          } else {
            this.error = res.message
          }
        } else {
          const res = await api.get<Guide[]>('/guides/all')
          if (res.success) {
            this.guides = res.data || []
            this.guidesMeta.total = this.guides.length
            this.guidesMeta.lastPage = 1
            this.guidesMeta.currentPage = 1
          } else {
            this.error = res.message
          }
        }
      } catch (err: any) {
        this.error = err.message || 'Erreur lors du chargement des guides'
      } finally {
        this.loading = false
      }
    },

    async fetchBookings(params: { page?: number; limit?: number; status?: string; guide_id?: string } = {}) {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const page = params.page ?? this.bookingsMeta.currentPage
        const limit = params.limit ?? this.bookingsMeta.perPage
        const body: Record<string, unknown> = { page, limit }
        if (params.status) body.status = params.status
        if (params.guide_id) body.guide_id = params.guide_id
        const res = await api.post<any>('/guide-bookings/all', body, { query: { page, limit } })
        if (res.success) {
          applyPaginator(res, this.bookings, this.bookingsMeta)
        } else {
          this.error = res.message
        }
      } catch (err: any) {
        this.error = err.message || 'Erreur lors du chargement des réservations'
      } finally {
        this.loading = false
      }
    },

    async createBooking(bookingData: Partial<GuideBooking>) {
      this.loading = true
      try {
        const api = useApi()
        const res = await api.post<GuideBooking>('/guide-bookings', bookingData)
        if (res.success && res.data) {
          this.bookings.unshift(res.data)
          this.bookingsMeta.total++
          return res.data
        }
        throw new Error(res.message)
      } finally {
        this.loading = false
      }
    },

    async updateBookingStatus(id: string, status: GuideBooking['status']) {
      const api = useApi()
      const res = await api.put<GuideBooking>(`/guide-bookings/${id}/status`, { status })
      if (res.success && res.data) {
        const idx = this.bookings.findIndex(b => b.id === id)
        if (idx !== -1) {
          this.bookings[idx] = { ...this.bookings[idx], ...res.data }
        }
        return res.data
      }
      return null
    },

    async deleteBooking(id: string) {
      const api = useApi()
      const res = await api.delete(`/guide-bookings/${id}`)
      if (res.success) {
        this.bookings = this.bookings.filter(b => b.id !== id)
        this.bookingsMeta.total = Math.max(0, this.bookingsMeta.total - 1)
        return true
      }
      throw new Error(res.message || 'Suppression impossible')
    },

    async createGuide(guideData: Partial<Guide>) {
      const api = useApi()
      const res = await api.post<Guide>('/guides', guideData)
      if (res.success && res.data) {
        this.guides.unshift(res.data)
        this.guidesMeta.total++
        return res.data
      }
      throw new Error(res.message)
    },

    async updateGuide(id: string, guideData: Partial<Guide>) {
      const api = useApi()
      const res = await api.put<Guide>(`/guides/${id}`, guideData)
      if (res.success && res.data) {
        const idx = this.guides.findIndex(g => g.id === id)
        if (idx !== -1) this.guides[idx] = res.data
        return res.data
      }
      throw new Error(res.message)
    },

    async deleteGuide(id: string) {
      const api = useApi()
      const res = await api.delete(`/guides/${id}`)
      if (res.success) {
        this.guides = this.guides.filter(g => g.id !== id)
        this.guidesMeta.total = Math.max(0, this.guidesMeta.total - 1)
        return true
      }
      throw new Error(res.message)
    },

    filterGuides(filters: {
      city?: string
      language?: string
      specialization?: string
      minRating?: number
      maxPrice?: number
    }) {
      return this.guides.filter(guide => {
        if (filters.city && !guide.cities?.includes(filters.city)) return false
        if (filters.language && !guide.languages?.includes(filters.language)) return false
        if (filters.specialization && !(guide.specializations_fr?.includes(filters.specialization) || guide.specializations_en?.includes(filters.specialization))) return false
        if (filters.minRating && guide.rating < filters.minRating) return false
        if (filters.maxPrice && (guide.price_per_day ?? 0) > filters.maxPrice) return false
        return true
      })
    }
  }
})

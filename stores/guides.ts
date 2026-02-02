import { defineStore } from 'pinia'
import { FAKE_GUIDES } from '~/utils/data/fakeData'

export interface Guide {
  id: string
  name: string
  languages: string[]
  specializations: string[]
  cities: string[]
  experience: number
  rating: number
  reviews: number
  avatar: string
  pricePerDay: number
  pricePerHour: number
  description: string
  available: boolean
}

export interface GuideBooking {
  id: string
  guideId: string
  userId: string
  startDate: string
  endDate: string
  serviceType: 'hourly' | 'daily'
  hours?: number
  days?: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
}

interface GuidesState {
  guides: Guide[]
  bookings: GuideBooking[]
  loading: boolean
  error: string | null
}

export const useGuidesStore = defineStore('guides', {
  state: (): GuidesState => ({
    guides: [],
    bookings: [],
    loading: false,
    error: null
  }),

  getters: {
    getGuideById: (state) => (id: string) => {
      return state.guides.find(g => g.id === id)
    },

    getAvailableGuides: (state) => {
      return state.guides.filter(g => g.available)
    },

    getGuidesByCity: (state) => (city: string) => {
      return state.guides.filter(g => g.cities.includes(city))
    },

    getGuidesByLanguage: (state) => (language: string) => {
      return state.guides.filter(g => g.languages.includes(language))
    },

    getGuidesBySpecialization: (state) => (spec: string) => {
      return state.guides.filter(g => g.specializations.includes(spec))
    },

    getBookingsByUser: (state) => (userId: string) => {
      return state.bookings.filter(b => b.userId === userId)
    },

    getBookingsByGuide: (state) => (guideId: string) => {
      return state.bookings.filter(b => b.guideId === guideId)
    },

    allCities: (state) => {
      const cities = new Set<string>()
      state.guides.forEach(g => g.cities.forEach(c => cities.add(c)))
      return Array.from(cities)
    },

    allLanguages: (state) => {
      const languages = new Set<string>()
      state.guides.forEach(g => g.languages.forEach(l => languages.add(l)))
      return Array.from(languages)
    },

    allSpecializations: (state) => {
      const specs = new Set<string>()
      state.guides.forEach(g => g.specializations.forEach(s => specs.add(s)))
      return Array.from(specs)
    }
  },

  actions: {
    async fetchGuides() {
      this.loading = true
      this.error = null

      try {
        await new Promise(resolve => setTimeout(resolve, 300))

        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('guides')
          this.guides = saved ? JSON.parse(saved) : [...FAKE_GUIDES]
        } else {
          this.guides = [...FAKE_GUIDES]
        }
      } catch (err) {
        this.error = 'Erreur lors du chargement des guides'
      } finally {
        this.loading = false
      }
    },

    async fetchBookings() {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('guideBookings')
        this.bookings = saved ? JSON.parse(saved) : []
      }
    },

    async createBooking(bookingData: Partial<GuideBooking>) {
      this.loading = true

      try {
        await new Promise(resolve => setTimeout(resolve, 500))

        const guide = this.getGuideById(bookingData.guideId || '')
        if (!guide) throw new Error('Guide non trouvé')

        let totalPrice = 0
        if (bookingData.serviceType === 'hourly' && bookingData.hours) {
          totalPrice = guide.pricePerHour * bookingData.hours
        } else if (bookingData.serviceType === 'daily' && bookingData.days) {
          totalPrice = guide.pricePerDay * bookingData.days
        }

        const newBooking: GuideBooking = {
          id: `booking_${Date.now()}`,
          guideId: bookingData.guideId || '',
          userId: bookingData.userId || '',
          startDate: bookingData.startDate || '',
          endDate: bookingData.endDate || '',
          serviceType: bookingData.serviceType || 'daily',
          hours: bookingData.hours,
          days: bookingData.days,
          totalPrice,
          status: 'pending',
          notes: bookingData.notes,
          createdAt: new Date().toISOString()
        }

        this.bookings.unshift(newBooking)
        this.saveBookingsToLocalStorage()

        return newBooking
      } finally {
        this.loading = false
      }
    },

    async updateBookingStatus(id: string, status: GuideBooking['status']) {
      const booking = this.bookings.find(b => b.id === id)
      if (booking) {
        booking.status = status
        this.saveBookingsToLocalStorage()
        return booking
      }
      return null
    },

    saveBookingsToLocalStorage() {
      if (typeof window !== 'undefined') {
        localStorage.setItem('guideBookings', JSON.stringify(this.bookings))
      }
    },

    filterGuides(filters: {
      city?: string
      language?: string
      specialization?: string
      minRating?: number
      maxPrice?: number
    }) {
      return this.guides.filter(guide => {
        if (filters.city && !guide.cities.includes(filters.city)) return false
        if (filters.language && !guide.languages.includes(filters.language)) return false
        if (filters.specialization && !guide.specializations.includes(filters.specialization)) return false
        if (filters.minRating && guide.rating < filters.minRating) return false
        if (filters.maxPrice && guide.pricePerDay > filters.maxPrice) return false
        return true
      })
    }
  }
})

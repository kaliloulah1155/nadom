import { defineStore } from 'pinia'
import { FAKE_PERSONAL_SHOPPING_REQUESTS, FAKE_CATEGORIES } from '~/utils/data/fakeData'

export type RequestStatus = 'pending' | 'searching' | 'negotiating' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'

export interface QuotedDetails {
  productCost: number
  serviceFee: number
  inspectionFee: number
  packagingFee: number
  shippingCost: number
  totalPrice: number
}

export interface PersonalShoppingRequest {
  id: string
  userId: string
  status: RequestStatus
  category: string
  title: string
  description: string
  images: string[]
  budgetEstimated: number
  quantity: number
  quotedPrice?: number
  quotedDetails?: QuotedDetails
  assignedAgent?: string
  whatsappMessages: number
  trackingNumber?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name_fr: string
  name_en: string
  icon: string
  color: string
}

interface PersonalShoppingState {
  requests: PersonalShoppingRequest[]
  categories: Category[]
  loading: boolean
  error: string | null
}

export const usePersonalShoppingStore = defineStore('personalShopping', {
  state: (): PersonalShoppingState => ({
    requests: [],
    categories: [],
    loading: false,
    error: null
  }),

  getters: {
    getRequestById: (state) => (id: string) => {
      return state.requests.find(r => r.id === id)
    },

    getRequestsByUser: (state) => (userId: string) => {
      return state.requests.filter(r => r.userId === userId)
    },

    getRequestsByStatus: (state) => (status: RequestStatus) => {
      return state.requests.filter(r => r.status === status)
    },

    getPendingRequests: (state) => {
      return state.requests.filter(r => r.status === 'pending')
    },

    getActiveRequests: (state) => {
      const activeStatuses: RequestStatus[] = ['searching', 'negotiating', 'confirmed', 'preparing']
      return state.requests.filter(r => activeStatuses.includes(r.status))
    },

    getCompletedRequests: (state) => {
      return state.requests.filter(r => r.status === 'delivered')
    },

    totalRequests: (state) => state.requests.length,

    totalRevenue: (state) => {
      return state.requests.reduce((total, req) => total + (req.quotedPrice || 0), 0)
    }
  },

  actions: {
    async fetchRequests() {
      this.loading = true
      this.error = null

      try {
        await new Promise(resolve => setTimeout(resolve, 300))

        // Charge depuis localStorage ou fake data
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('personalShoppingRequests')
          this.requests = saved ? JSON.parse(saved) : [...FAKE_PERSONAL_SHOPPING_REQUESTS]
        } else {
          this.requests = [...FAKE_PERSONAL_SHOPPING_REQUESTS]
        }
      } catch (err: any) {
        this.error = 'Erreur lors du chargement des demandes'
      } finally {
        this.loading = false
      }
    },

    async fetchCategories() {
      this.categories = (FAKE_CATEGORIES as any)
      return this.categories
    },

    async createRequest(requestData: Partial<PersonalShoppingRequest>) {
      this.loading = true
      this.error = null

      try {
        await new Promise(resolve => setTimeout(resolve, 500))

        const newRequest: PersonalShoppingRequest = {
          id: `req_${Date.now()}`,
          userId: requestData.userId || '',
          status: 'pending',
          category: requestData.category || '',
          title: requestData.title || '',
          description: requestData.description || '',
          images: requestData.images || [],
          budgetEstimated: requestData.budgetEstimated || 0,
          quantity: requestData.quantity || 1,
          whatsappMessages: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        this.requests.unshift(newRequest)
        this.saveToLocalStorage()

        return newRequest
      } catch (err: any) {
        this.error = 'Erreur lors de la création de la demande'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateRequest(id: string, updates: Partial<PersonalShoppingRequest>) {
      const idx = this.requests.findIndex(r => r.id === id)

      if (idx !== -1) {
        this.requests[idx] = {
          ...this.requests[idx],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        this.saveToLocalStorage()
        return this.requests[idx]
      }

      return null
    },

    async updateRequestStatus(id: string, status: RequestStatus) {
      return this.updateRequest(id, { status })
    },

    async addQuotation(id: string, quotedPrice: number, quotedDetails: QuotedDetails) {
      return this.updateRequest(id, {
        quotedPrice,
        quotedDetails,
        status: 'negotiating'
      })
    },

    async assignAgent(id: string, agentId: string) {
      return this.updateRequest(id, {
        assignedAgent: agentId,
        status: 'searching'
      })
    },

    async deleteRequest(id: string) {
      this.requests = this.requests.filter(r => r.id !== id)
      this.saveToLocalStorage()
    },

    saveToLocalStorage() {
      if (typeof window !== 'undefined') {
        localStorage.setItem('personalShoppingRequests', JSON.stringify(this.requests))
      }
    },

    // Admin actions
    getRequestsStats() {
      const stats = {
        total: this.requests.length,
        pending: 0,
        searching: 0,
        negotiating: 0,
        confirmed: 0,
        preparing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0
      }

      this.requests.forEach(r => {
        stats[r.status]++
      })

      return stats
    }
  }
})

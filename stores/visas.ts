import { defineStore } from 'pinia'
import { FAKE_VISAS } from '~/utils/data/fakeData'

export interface Visa {
  id: string
  name?: string
  type: string
  duration: string
  validity: string
  processingTime: string
  cost: number
  price?: number
  requirements: string[]
  requiredDocs?: string[]
  description: string
  pdfUrl?: string
  active?: boolean
}

export interface VisaApplication {
  id: string
  userId: string
  visaType: string
  status: 'pending' | 'processing' | 'approved' | 'rejected'
  applicantInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    nationality: string
    passportNumber: string
    passportExpiry: string
  }
  travelDates: {
    departure: string
    return?: string
  }
  documents: string[]
  notes?: string
  totalCost: number
  createdAt: string
  updatedAt: string
}

interface VisasState {
  visaTypes: Visa[]
  applications: VisaApplication[]
  loading: boolean
  error: string | null
}

export const useVisasStore = defineStore('visas', {
  state: (): VisasState => ({
    visaTypes: [],
    applications: [],
    loading: false,
    error: null
  }),

  getters: {
    getVisaByType: (state) => (type: string) => {
      return state.visaTypes.find(v => v.type === type)
    },

    getVisaById: (state) => (id: string) => {
      return state.visaTypes.find(v => v.id === id)
    },

    getApplicationsByUser: (state) => (userId: string) => {
      return state.applications.filter(a => a.userId === userId)
    },

    getApplicationsByStatus: (state) => (status: VisaApplication['status']) => {
      return state.applications.filter(a => a.status === status)
    },

    getPendingApplications: (state) => {
      return state.applications.filter(a => a.status === 'pending' || a.status === 'processing')
    }
  },

  actions: {
    async fetchVisaTypes() {
      this.loading = true
      this.error = null

      try {
        await new Promise(resolve => setTimeout(resolve, 300))

        // Read from localStorage (admin-configured data)
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('visas')
          if (saved) {
            const adminVisas = JSON.parse(saved)
            // Map admin structure to store structure
            this.visaTypes = adminVisas
              .filter((v: any) => v.active !== false)
              .map((v: any) => ({
                id: v.id,
                name: v.name,
                type: v.type || v.name,
                duration: v.duration,
                validity: v.validity,
                processingTime: v.processingTime,
                cost: v.price || v.cost,
                requirements: v.requiredDocs || v.requirements || [],
                description: v.description,
                pdfUrl: v.pdfUrl,
                active: v.active
              }))
          } else {
            // Fallback to fake data
            this.visaTypes = [...FAKE_VISAS]
          }
        } else {
          this.visaTypes = [...FAKE_VISAS]
        }
      } catch (err) {
        this.error = 'Erreur lors du chargement des types de visa'
      } finally {
        this.loading = false
      }
    },

    async fetchApplications() {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('visaApplications')
        this.applications = saved ? JSON.parse(saved) : []
      }
    },

    async createApplication(applicationData: Partial<VisaApplication>) {
      this.loading = true

      try {
        await new Promise(resolve => setTimeout(resolve, 500))

        const visa = this.visaTypes.find(v => v.type === applicationData.visaType)
        if (!visa) throw new Error('Type de visa non trouvé')

        const newApplication: VisaApplication = {
          id: `visa_app_${Date.now()}`,
          userId: applicationData.userId || '',
          visaType: applicationData.visaType || '',
          status: 'pending',
          applicantInfo: applicationData.applicantInfo || {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            nationality: '',
            passportNumber: '',
            passportExpiry: ''
          },
          travelDates: applicationData.travelDates || {
            departure: ''
          },
          documents: applicationData.documents || [],
          notes: applicationData.notes,
          totalCost: visa.cost,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        this.applications.unshift(newApplication)
        this.saveApplicationsToLocalStorage()

        return newApplication
      } finally {
        this.loading = false
      }
    },

    async updateApplicationStatus(id: string, status: VisaApplication['status'], notes?: string) {
      const application = this.applications.find(a => a.id === id)
      if (application) {
        application.status = status
        if (notes) application.notes = notes
        application.updatedAt = new Date().toISOString()
        this.saveApplicationsToLocalStorage()
        return application
      }
      return null
    },

    saveApplicationsToLocalStorage() {
      if (typeof window !== 'undefined') {
        localStorage.setItem('visaApplications', JSON.stringify(this.applications))
      }
    }
  }
})

import { defineStore } from 'pinia'
import { FAKE_VISAS } from '~/utils/data/fakeData'

export interface Visa {
  id: string
  name_fr: string
  name_en: string
  type: string
  duration_fr: string
  duration_en: string
  validity_fr: string
  validity_en: string
  processingTime_fr: string
  processingTime_en: string
  cost: number
  requirements_fr: string[]
  requirements_en: string[]
  description_fr: string
  description_en: string
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
            this.visaTypes = adminVisas.map((v: any) => ({
              id: v.id,
              name_fr: v.name_fr || v.name || '',
              name_en: v.name_en || v.name || '',
              type: v.type || v.name || '',
              duration_fr: v.duration_fr || v.duration || '',
              duration_en: v.duration_en || v.duration || '',
              validity_fr: v.validity_fr || v.validity || '',
              validity_en: v.validity_en || v.validity || '',
              processingTime_fr: v.processingTime_fr || v.processingTime || '',
              processingTime_en: v.processingTime_en || v.processingTime || '',
              cost: v.price || v.cost || 0,
              requirements_fr: v.requirements_fr || v.requiredDocs || v.requirements || [],
              requirements_en: v.requirements_en || v.requiredDocs || v.requirements || [],
              description_fr: v.description_fr || v.description || '',
              description_en: v.description_en || v.description || '',
              pdfUrl: v.pdfUrl,
              active: v.active !== false
            }))
          } else {
            this.visaTypes = FAKE_VISAS.map((v: any) => ({
              id: v.id,
              name_fr: v.name || '',
              name_en: v.name || '',
              type: v.type || v.name || '',
              duration_fr: v.duration || '',
              duration_en: v.duration || '',
              validity_fr: v.validity || '',
              validity_en: v.validity || '',
              processingTime_fr: v.processingTime || '',
              processingTime_en: v.processingTime || '',
              cost: v.price || v.cost || 0,
              requirements_fr: v.requiredDocs || v.requirements || [],
              requirements_en: v.requiredDocs || v.requirements || [],
              description_fr: v.description || '',
              description_en: v.description || '',
              pdfUrl: v.pdfUrl,
              active: v.active !== false
            }))
          }
        } else {
          this.visaTypes = []
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

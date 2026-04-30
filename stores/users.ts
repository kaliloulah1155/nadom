import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export interface User {
  id: string
  uuid: string
  firstname: string
  lastname: string
  email: string
  phone?: string
  sex?: string
  status: number
  role_id?: number
  company_id?: number
  role?: {
    id: number
    code: string
    label: string
  }
  company?: {
    id: number
    uuid: string
    name: string
  }
  picture?: string
  country?: string
  city?: string
  created_at: string
}

interface UsersState {
  users: User[]
  total: number
  currentPage: number
  perPage: number
  lastPage: number
  loading: boolean
  error: string | null
}

const SKIP_KEYS = new Set(['password_confirmation'])
const REQUIRED_KEYS = new Set(['firstname', 'lastname', 'email', 'password'])

function buildUserFormData(userData: Record<string, any>): FormData {
  const formData = new FormData()
  Object.keys(userData).forEach(key => {
    if (SKIP_KEYS.has(key)) return
    const value = userData[key]
    if (value === null || value === undefined) return
    if (typeof value === 'string' && value.trim() === '' && !REQUIRED_KEYS.has(key)) return
    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value)
    } else {
      formData.append(key, String(value))
    }
  })
  return formData
}

export const useUsersStore = defineStore('users', {
  state: (): UsersState => ({
    users: [],
    total: 0,
    currentPage: 1,
    perPage: 15,
    lastPage: 1,
    loading: false,
    error: null
  }),

  actions: {
    async fetchUsers(params: { page?: number; limit?: number; search?: string; role?: string; status?: string } = {}) {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const page = params.page || this.currentPage
        const limit = params.limit || this.perPage
        const body: Record<string, any> = { page, limit }
        if (params.search) body.search = params.search
        if (params.role) body.role = params.role
        if (params.status !== undefined && params.status !== '') body.status = params.status

        const res = await api.post<any>('/user/all', body, { query: { page, limit } })

        if (res.success && res.data) {
          const d: any = res.data
          if (Array.isArray(d?.data)) {
            this.users = d.data
            this.total = d.total ?? d.data.length
            this.currentPage = d.current_page ?? page
            this.perPage = d.per_page ?? limit
            this.lastPage = d.last_page ?? 1
          } else if (Array.isArray(d)) {
            this.users = d
            this.total = d.length
            this.currentPage = 1
            this.lastPage = 1
          } else {
            this.users = []
            this.total = 0
            this.lastPage = 1
          }
        } else {
          this.error = res.message
        }
      } catch (err: any) {
        this.error = 'Erreur lors du chargement des utilisateurs'
      } finally {
        this.loading = false
      }
    },

    async createUser(userData: any) {
      const api = useApi()
      const formData = buildUserFormData(userData)

      const res = await api.post<User>('/user', formData)
      if (res.success && res.data) {
        // En cas de succès, on rafraîchit la première page
        await this.fetchUsers({ page: 1 })
        return res.data
      }
      throw new Error(res.message)
    },

    async updateUser(uuid: string, userData: any) {
      const api = useApi()
      const formData = buildUserFormData(userData)

      // Method tunneling for PUT with FormData
      formData.append('_method', 'PUT')

      const res = await api.post<User>(`/user/${uuid}`, formData)
      if (res.success && res.data) {
        const idx = this.users.findIndex(u => u.uuid === uuid)
        if (idx !== -1) {
          this.users[idx] = res.data
        }
        return res.data
      }
      throw new Error(res.message)
    },

    async deleteUser(uuid: string) {
      const api = useApi()
      const res = await api.delete(`/user/${uuid}`)
      if (res.success) {
        this.users = this.users.filter(u => u.uuid !== uuid)
        this.total--
        return true
      }
      throw new Error(res.message)
    }
  }
})

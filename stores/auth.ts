import { defineStore } from 'pinia'
import { useApi, setToken, clearToken, getToken } from '~/composables/useApi'

interface User {
  id?: string
  uuid?: string
  email: string
  firstname?: string
  lastname?: string
  firstName?: string
  lastName?: string
  phone?: string
  country?: string
  city?: string
  avatar?: string
  picture?: string
  role?: any
  company?: any
  perm?: Record<string, boolean>
  ability?: { rules: Array<{ action: string; subject: string }> }
  wallet?: any
}

interface AuthState {
  currentUser: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    currentUser: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    isAdmin: (state) => {
      const code = (typeof state.currentUser?.role === 'object' ? state.currentUser?.role?.code : state.currentUser?.role) || ''
      const n = code.toString().toLowerCase().trim()
      return n === 'admin' || n === 'super-admin'
    },
    isSuperAdmin: (state) => {
      const code = (typeof state.currentUser?.role === 'object' ? state.currentUser?.role?.code : state.currentUser?.role) || ''
      return code.toString().toLowerCase().trim() === 'super-admin'
    },
    isClient: (state) => state.currentUser?.role?.code === 'client' || state.currentUser?.role === 'client',
    isAgent: (state) => state.currentUser?.role?.code === 'agent' || state.currentUser?.role === 'agent',
    hasBackofficeAccess: (state) => {
      if (!state.currentUser) return false
      const roleData = state.currentUser.role
      const roleCode = (typeof roleData === 'object' ? roleData?.code : roleData) || ''
      const normalizedCode = roleCode.toString().toLowerCase().trim()
      return ['admin', 'agent', 'super-admin'].includes(normalizedCode)
    },
    userEmail: (state) => state.currentUser?.email || '',
    userFullName: (state) => {
      if (!state.currentUser) return ''
      const first = state.currentUser.firstname || state.currentUser.firstName || ''
      const last = state.currentUser.lastname || state.currentUser.lastName || ''
      return `${first} ${last}`.trim()
    },
    // Identifiant utilise par les cles etrangeres (`shipments.user_id`,
    // `personal_shopping_requests.user_id`) : c'est l'ID, pas l'uuid. L'inverse
    // faisait remonter zero partout sur le tableau de bord client.
    userId: (state) => state.currentUser?.id ?? state.currentUser?.uuid ?? ''
  },

  actions: {
    async login(credentials: { email?: string; phone?: string; password: string }) {
      this.loading = true
      this.error = null

      try {
        const api = useApi()
        const res = await api.post<{ token: string; token_type: string }>('/auth/login', credentials)
        console.log('[Store] Login response:', res)

        if (!res.success || !res.data?.token) {
          console.error('[Store] Login failed or no token:', res.message)
          throw new Error(res.message || 'Échec de connexion')
        }

        setToken(res.data.token)
        this.token = res.data.token
        console.log('[Store] Token set, fetching user...')

        await this.fetchUser()
        console.log('[Store] Fetch user done. User:', this.currentUser)
        return this.currentUser
      } catch (err: any) {
        console.error('[Store] Login Error catch:', err)
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async register(userData: {
      email: string
      password: string
      firstname: string
      lastname: string
      phone?: string
      country?: string
      city?: string
    }) {
      this.loading = true
      this.error = null

      try {
        const api = useApi()
        const res = await api.post('/user', userData)

        if (!res.success) {
          throw new Error(res.message || 'Erreur lors de la création du compte')
        }

        return res.data
      } catch (err: any) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchUser() {
      const api = useApi()
      const res = await api.get<User>('/auth/user')

      if (res.success && res.data) {
        this.currentUser = res.data
        this.isAuthenticated = true
        return res.data
      }

      this.currentUser = null
      this.isAuthenticated = false
      return null
    },

    async logout() {
      try {
        const api = useApi()
        await api.post('/auth/logout')
      } catch (e) {
        // Token déjà révoqué côté serveur — on nettoie le local quand même
      } finally {
        // Nettoyage des canaux Pusher pour eviter de garder une souscription orpheline
        try {
          const { useNotificationsStore } = await import('~/stores/notifications')
          useNotificationsStore().unbindRealtime()
        } catch (_) {
          // ignore
        }
        clearToken()
        this.currentUser = null
        this.token = null
        this.isAuthenticated = false
        this.error = null
      }
    },

    async initializeAuth() {
      const token = getToken()
      if (!token) return

      this.token = token
      try {
        await this.fetchUser()
      } catch (e) {
        clearToken()
        this.token = null
        this.isAuthenticated = false
      }
    },

    async updateProfile(updates: { firstname?: string; lastname?: string; sex?: string; phone?: string; country?: string; city?: string }) {
      if (!this.currentUser) return

      this.loading = true
      try {
        const api = useApi()
        const res = await api.put<User>('/auth/profile', updates)

        if (res.success && res.data) {
          this.currentUser = { ...this.currentUser, ...res.data }
        } else {
          throw new Error(res.message || 'Erreur lors de la mise à jour du profil')
        }

        return this.currentUser
      } finally {
        this.loading = false
      }
    },

    async changePassword(payload: { current_password: string; new_password: string }) {
      this.loading = true
      try {
        const api = useApi()
        const res = await api.put('/auth/password', payload)
        if (!res.success) {
          throw new Error(res.message || 'Erreur lors du changement de mot de passe')
        }
        return true
      } finally {
        this.loading = false
      }
    }
  }
})

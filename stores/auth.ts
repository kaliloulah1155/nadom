import { defineStore } from 'pinia'
import { FAKE_USERS } from '~/utils/data/fakeData'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'client' | 'admin' | 'agent'
  phone?: string
  country?: string
  city?: string
  avatar?: string
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
    isAdmin: (state) => state.currentUser?.role === 'admin',
    isClient: (state) => state.currentUser?.role === 'client',
    isAgent: (state) => state.currentUser?.role === 'agent',
    userEmail: (state) => state.currentUser?.email || '',
    userFullName: (state) => state.currentUser
      ? `${state.currentUser.firstName} ${state.currentUser.lastName}`
      : '',
    userId: (state) => state.currentUser?.id || ''
  },

  actions: {
    async login(email: string, password: string) {
      this.loading = true
      this.error = null

      try {
        // Simule un délai réseau
        await new Promise(resolve => setTimeout(resolve, 500))

        // Recherche utilisateur dans fake data
        const user = FAKE_USERS.find(u => u.email === email)

        if (user && user.password === password) {
          this.currentUser = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            phone: user.phone,
            country: user.country,
            city: user.city,
            avatar: user.avatar
          }
          this.token = `token_${Date.now()}_${user.id}`
          this.isAuthenticated = true

          // Sauvegarde localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth', JSON.stringify({
              user: this.currentUser,
              token: this.token
            }))
          }

          return this.currentUser
        } else {
          throw new Error('Email ou mot de passe incorrect')
        }
      } catch (err: any) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async register(userData: {
      email: string
      password: string
      firstName: string
      lastName: string
      phone?: string
      country?: string
      city?: string
    }) {
      this.loading = true
      this.error = null

      try {
        await new Promise(resolve => setTimeout(resolve, 500))

        // Vérifie si email existe déjà
        const existingUser = FAKE_USERS.find(u => u.email === userData.email)
        if (existingUser) {
          throw new Error('Cet email est déjà utilisé')
        }

        // Crée nouvel utilisateur
        const newUser: User = {
          id: `user_${Date.now()}`,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: 'client',
          phone: userData.phone,
          country: userData.country,
          city: userData.city,
          avatar: `https://ui-avatars.com/api/?name=${userData.firstName}+${userData.lastName}&background=random`
        }

        this.currentUser = newUser
        this.token = `token_${Date.now()}_${newUser.id}`
        this.isAuthenticated = true

        // Sauvegarde localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth', JSON.stringify({
            user: this.currentUser,
            token: this.token
          }))
        }

        return newUser
      } catch (err: any) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.currentUser = null
      this.token = null
      this.isAuthenticated = false
      this.error = null

      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth')
      }
    },

    initializeAuth() {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('auth')
        if (saved) {
          try {
            const { user, token } = JSON.parse(saved)
            this.currentUser = user
            this.token = token
            this.isAuthenticated = true
          } catch (e) {
            localStorage.removeItem('auth')
          }
        }
      }
    },

    async updateProfile(updates: Partial<User>) {
      if (!this.currentUser) return

      this.loading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))

        this.currentUser = {
          ...this.currentUser,
          ...updates
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('auth', JSON.stringify({
            user: this.currentUser,
            token: this.token
          }))
        }

        return this.currentUser
      } finally {
        this.loading = false
      }
    }
  }
})

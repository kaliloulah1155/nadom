import { useAuthStore } from '~/stores/auth'
import { getToken } from '~/composables/useApi'

export default defineNuxtRouteMiddleware(async (to) => {
  if (typeof window === 'undefined') return

  const token = getToken()
  if (!token) return navigateTo('/login')

  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    await authStore.initializeAuth()
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})

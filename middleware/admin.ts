import { useAuthStore } from '~/stores/auth'
import { getToken } from '~/composables/useApi'

export default defineNuxtRouteMiddleware(async (to) => {
  if (typeof window === 'undefined') return

  const token = getToken()
  if (!token) {
    return navigateTo('/login')
  }

  const authStore = useAuthStore()

  // Initialize auth if not already done
  if (!authStore.isAuthenticated) {
    await authStore.initializeAuth()
  }

  // Final check
  if (!authStore.isAdmin) {
    // If authenticated but not admin, go to home
    if (authStore.isAuthenticated) {
      return navigateTo('/')
    }
    // Otherwise go to login
    return navigateTo('/login')
  }
})

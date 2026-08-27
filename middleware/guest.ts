import { useAuthStore } from '~/stores/auth'
import { getToken } from '~/composables/useApi'

/** Empêche un utilisateur déjà connecté de revoir le formulaire de login. */
export default defineNuxtRouteMiddleware(async () => {
  if (typeof window === 'undefined') return

  const token = getToken()
  if (!token) return

  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    await authStore.initializeAuth()
  }

  if (authStore.isAuthenticated) {
    return navigateTo(authStore.hasBackofficeAccess ? '/admin/dashboard' : '/dashboard')
  }
})

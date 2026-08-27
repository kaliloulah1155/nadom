import { useAuthStore } from '~/stores/auth'
import { getToken } from '~/composables/useApi'

export default defineNuxtRouteMiddleware(async (to) => {
  if (typeof window === 'undefined') return

  // Only protect routes starting with /admin
  if (!to.path.startsWith('/admin')) {
    return
  }

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
  if (!authStore.hasBackofficeAccess) {
    // Un client qui tente une URL /admin est renvoyé vers SON espace, et non vers
    // l'accueil : il y retrouve son contexte, et la séparation des deux interfaces
    // reste lisible (le pendant de ce garde-fou est le middleware `client-only`,
    // qui écarte les utilisateurs back-office de l'espace client).
    if (authStore.isAuthenticated) {
      return navigateTo('/dashboard')
    }
    // Otherwise go to login
    return navigateTo('/login')
  }
})

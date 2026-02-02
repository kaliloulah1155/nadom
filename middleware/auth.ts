export default defineNuxtRouteMiddleware((to, from) => {
  // Check if we're on client side
  if (typeof window === 'undefined') return

  // Check auth from localStorage
  const authData = localStorage.getItem('auth')

  if (!authData) {
    return navigateTo('/login')
  }

  try {
    const { user, token } = JSON.parse(authData)
    if (!user || !token) {
      return navigateTo('/login')
    }
  } catch (e) {
    localStorage.removeItem('auth')
    return navigateTo('/login')
  }
})

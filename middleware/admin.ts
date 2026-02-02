export default defineNuxtRouteMiddleware((to, from) => {
  // Check if we're on client side
  if (typeof window === 'undefined') return

  // Check auth from localStorage
  const authData = localStorage.getItem('auth')

  if (!authData) {
    return navigateTo('/login')
  }

  try {
    const { user } = JSON.parse(authData)

    if (!user) {
      return navigateTo('/login')
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return navigateTo('/')
    }
  } catch (e) {
    localStorage.removeItem('auth')
    return navigateTo('/login')
  }
})

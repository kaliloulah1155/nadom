import { useAuthStore } from '~/stores/auth'
import { getToken } from '~/composables/useApi'

/**
 * Écarte les utilisateurs back-office (admin, agent, super-admin) de TOUTE
 * page cliente, pas seulement celles ayant un équivalent back-office direct.
 *
 * Auparavant applique uniquement aux pages listees dans `equivalences` via
 * `definePageMeta({ middleware: ['client-only'] })` : une fois connecte, un
 * membre de l'equipe pouvait encore se promener librement sur l'accueil, le
 * blog, le calculateur, etc. — rien ne l'en empechait tant que la page ne
 * figurait pas dans cette liste explicite. Middleware global desormais : tant
 * qu'il ne s'est pas deconnecte, un compte back-office est toujours renvoye
 * vers son espace, sur n'importe quelle route hors /admin.
 *
 * Les visiteurs et les clients ne sont jamais concernes : sans jeton, ou sans
 * role back-office, la page s'affiche normalement.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (typeof window === 'undefined') return

  // L'espace back-office et les pages d'authentification restent hors champ :
  // une regle globale qui les redirigerait aussi produirait une boucle.
  const horsChamp = ['/admin', '/login', '/register', '/forgot-password']
  if (horsChamp.some((p) => to.path === p || to.path.startsWith(p + '/'))) {
    return
  }

  // Pas de session : c'est un visiteur, il a toute sa place ici.
  if (!getToken()) return

  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    await authStore.initializeAuth()
  }

  if (!authStore.hasBackofficeAccess) return

  // Chaque page client renvoie vers son pendant back-office quand il existe.
  const equivalences: { prefixe: string; vers: string }[] = [
    { prefixe: '/personal-shopping/new', vers: '/admin/requests' },
    { prefixe: '/personal-shopping', vers: '/admin/requests' },
    { prefixe: '/import-export/envoi-colis', vers: '/admin/requests' },
    { prefixe: '/import-export/tracking', vers: '/admin/shipments' },
    { prefixe: '/guide', vers: '/admin/guide-bookings' },
    { prefixe: '/visa', vers: '/admin/visas' },
    // Espace client : réservé aux demandeurs, l'équipe a son propre back-office.
    { prefixe: '/dashboard', vers: '/admin/dashboard' },
    { prefixe: '/profile', vers: '/admin/dashboard' },
  ]

  const cible = equivalences.find((e) => to.path.startsWith(e.prefixe))
  return navigateTo(cible ? cible.vers : '/admin/dashboard')
})

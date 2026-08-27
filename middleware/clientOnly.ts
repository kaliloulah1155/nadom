import { useAuthStore } from '~/stores/auth'
import { getToken } from '~/composables/useApi'

/**
 * Écarte les utilisateurs back-office (admin, agent, super-admin) des pages
 * destinées aux clients.
 *
 * Ces pages disposent toutes d'un équivalent côté back-office — les demandes se
 * créent désormais dans une modale depuis « Demandes », et se consultent sur la
 * fiche admin. Un membre de l'équipe n'a donc aucune raison de passer par
 * l'interface client : il y perdrait le contexte de son travail, et la demande
 * qu'il y créerait lui serait rattachée comme s'il en était le client.
 *
 * Les visiteurs et les clients ne sont jamais concernés : sans jeton, ou sans
 * rôle back-office, la page s'affiche normalement.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (typeof window === 'undefined') return

  // Pas de session : c'est un visiteur, il a toute sa place ici.
  if (!getToken()) return

  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    await authStore.initializeAuth()
  }

  if (!authStore.hasBackofficeAccess) return

  // Chaque page client renvoie vers son pendant back-office.
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

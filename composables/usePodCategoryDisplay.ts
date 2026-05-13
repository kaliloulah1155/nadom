/**
 * Affichage des catégories produits (slug POD) : icônes renvoyées par l’API + repli par code métier.
 */

export const POD_CATEGORY_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#22c55e',
  '#6366f1',
  '#f97316',
  '#14b8a6',
  '#a855f7',
]

/** Icônes Bootstrap par code catégorie (si la colonne `icon` est vide en base). */
export const POD_CATEGORY_ICON_BY_CODE: Record<string, string> = {
  dairy: 'bi bi-cup-hot',
  staple: 'bi bi-basket',
  citrus: 'bi bi-droplet',
  electronics: 'bi bi-laptop',
  clothing: 'bi bi-scissors',
  phone: 'bi bi-phone',
  vehicle: 'bi bi-car-front',
  car: 'bi bi-car-front',
}

export function normalizeBootstrapIcon(ic: string | null | undefined): string {
  const s = String(ic ?? '').trim()
  if (!s) return ''
  if (s.startsWith('bi bi-')) return s
  if (s.startsWith('bi-')) return `bi ${s}`
  return s.includes(' ') ? s : `bi ${s}`
}

export function resolvePodCategoryIcon(category: { icon?: string | null; code?: string | null }): string {
  const fromApi = normalizeBootstrapIcon(category.icon ?? '')
  if (fromApi) return fromApi
  const code = String(category.code || '').toLowerCase()
  if (code && POD_CATEGORY_ICON_BY_CODE[code]) return POD_CATEGORY_ICON_BY_CODE[code]
  return 'bi bi-tags'
}

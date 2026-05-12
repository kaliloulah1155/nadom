/**
 * Limites et nettoyage côté client pour le formulaire contact public.
 * Le serveur doit valider aussi (voir StorePublicContactLeadRequest).
 */

export const CONTACT_FORM_LIMITS = {
  name: 120,
  email: 254,
  phone: 40,
  subject: 180,
  message: 2500
} as const

/** Retire les balises HTML/XML (prévenir XSS lors d’un futur affichage) et caractères de contrôle. */
export function sanitizePlainText(raw: unknown, maxLen: number): string {
  let s = typeof raw === 'string' ? raw : ''
  // Balises potentiellement du HTML/script
  s = s.replace(/<[^>]*>/g, '')
  // Caractères de contrôle dangereux ou indésirables
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  const norm = typeof s.normalize === 'function' ? s.normalize('NFKC') : s
  return norm.trim().slice(0, maxLen)
}

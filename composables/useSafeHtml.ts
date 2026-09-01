import DOMPurify from 'dompurify'

/**
 * Neutralise le HTML redige par le staff (WYSIWYG : FAQ, produits, tarifs,
 * services, visas...) avant un rendu v-html public. Ce contenu est deja
 * trusted (auteur = compte admin/agent), mais un sanitizer limite l'impact
 * si un compte staff est un jour compromis (defense en profondeur — voir
 * aussi enrichBlogBodyHtml pour le corps des articles de blog).
 *
 * Cote client uniquement : DOMPurify a besoin du DOM. Sans effet en dehors
 * du navigateur (app en mode SPA, ssr:false).
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html || typeof html !== 'string') return ''
  if (typeof window === 'undefined') return html

  return DOMPurify.sanitize(html)
}

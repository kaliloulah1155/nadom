/**
 * Empeche l'indexation de tout ce qui n'est pas le domaine de production, et du
 * back-office meme sur le bon domaine.
 *
 * Le meme build tourne sur nadom.co (prod) et rc.nadom.co (recette) : sans ce
 * garde-fou, Google crawle et indexe les deux, avec un contenu identique et
 * aucun canonical statique possible (SPA, ssr:false => pas de <head> par route
 * dans le HTML servi). Resultat observe : Google affiche l'URL nadom.co avec un
 * titre pioche sur rc.nadom.co, preuve d'une confusion de contenu duplique.
 *
 * L'entete HTTP X-Robots-Tag est respecte par Google independamment du rendu
 * JS de la page, contrairement a une balise <meta> injectee cote client.
 */
export default defineEventHandler((event) => {
  const host = (getRequestHost(event, { xForwardedHost: true }) || '').toLowerCase()
  const isCanonicalHost = host === 'nadom.co' || host === 'www.nadom.co'
  const isAdminPath = (event.path || '').startsWith('/admin')

  if (!isCanonicalHost || isAdminPath) {
    setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  }
})

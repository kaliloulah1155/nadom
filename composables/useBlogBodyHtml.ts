/**
 * Extrait l'identifiant vidéo YouTube d'une URL (watch, youtu.be, shorts, embed).
 */
export function youtubeVideoId(url: string): string | null {
  try {
    const u = new URL(String(url).trim())
    const host = u.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').slice(0, 11)
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (u.pathname.startsWith('/shorts/')) {
        const id = u.pathname.replace('/shorts/', '').slice(0, 11)
        return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null
      }
      if (u.pathname.startsWith('/embed/')) {
        const id = u.pathname.replace('/embed/', '').slice(0, 11)
        return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null
      }
      const v = u.searchParams.get('v')
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v
    }
  } catch {
    return null
  }
  return null
}

/**
 * Convertit une URL YouTube en URL d'embed (`/embed/{id}`), ou renvoie null si ce
 * n'est pas une URL YouTube reconnue. Utilisé par l'éditeur (insertion d'une vidéo)
 * et par le rendu public.
 */
export function youtubeEmbedSrc(url: string): string | null {
  const id = youtubeVideoId(url)
  return id ? `https://www.youtube.com/embed/${id}` : null
}

/**
 * Prépare le HTML article blog pour l'affichage public :
 * - convertit les URLs YouTube (watch, youtu.be, shorts) en iframes embed lisibles ;
 * - normalise les iframes existantes (ex. `ql-video` de Quill) vers `/embed/{id}` ;
 * - conserve les iframes déjà présentes si hébergées sur youtube.com ;
 * - supprime les balises script.
 */
export function enrichBlogBodyHtml(html: string): string {
  if (!html || typeof html !== 'string') return ''

  let h = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  const embedIframe = (videoId: string) =>
    `<span class="blog-video-wrapper"><iframe class="blog-video-iframe" src="https://www.youtube.com/embed/${videoId}" title="YouTube" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></span>`

  // Iframes déjà présentes (ex. bouton vidéo Quill → <iframe class="ql-video" src="...watch?v=...">) :
  // on réécrit le src vers la forme /embed/ quand c'est une URL YouTube.
  h = h.replace(/(<iframe\b[^>]*\bsrc=)["']([^"']+)["']/gi, (full, prefix, src) => {
    const embed = youtubeEmbedSrc(src)
    return embed ? `${prefix}"${embed}"` : full
  })

  // youtube.com/watch?v= et variantes dans du texte ou liens HTML
  h = h.replace(
    /https?:\/\/(?:www\.)?youtube\.com\/watch\?(?:[^"'\s<>]*&)?v=([a-zA-Z0-9_-]{11})(?:&[^"'\s<>]*)?/gi,
    (match, id) => embedIframe(id)
  )
  h = h.replace(/https?:\/\/(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?[^"'\s<>]*)?/gi, (match, id) => embedIframe(id))
  h = h.replace(/https?:\/\/(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:\?[^"'\s<>]*)?/gi, (match, id) => embedIframe(id))

  // Liens <a href="youtube..."> seul enfant → iframe (évite doublon si URL déjà remplacée)
  h = h.replace(
    /<a[^>]+href=["'](https?:\/\/[^"']*youtube[^"']*)["'][^>]*>\s*<\/a>/gi,
    (full, url) => {
      const id = youtubeVideoId(url)
      return id ? embedIframe(id) : full
    }
  )

  return h
}

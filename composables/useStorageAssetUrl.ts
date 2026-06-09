/**
 * URLs des fichiers publics Laravel (`storage/app/public/...`).
 *
 * Base utilisée, dans l'ordre :
 *  1. `storageBase` (NUXT_PUBLIC_STORAGE_BASE) — l'URL du BACKEND qui sert /storage.
 *  2. fallback : `apiBase` sans le suffixe `/api`.
 * On ajoute ensuite `/storage/{path}`.
 *
 * Les URLs absolues qui pointent vers un `/storage/...` (ex. images uploadées et
 * enregistrées en base avec un mauvais host comme `https://www.nadom.co/storage/...`)
 * sont automatiquement « rebasées » sur la bonne base. Les autres URLs absolues
 * (placehold.co, loremflickr, etc.) sont renvoyées telles quelles.
 */
export function resolveStorageAssetUrl(path: string | null | undefined): string {
  if (path == null || path === '') return ''
  const s = String(path).trim()

  const config = useRuntimeConfig()
  const storageBase = String(config.public.storageBase ?? '').trim()
  const base = (storageBase !== ''
    ? storageBase
    : String(config.public.apiBase ?? '').replace(/\/api\/?$/i, '')
  ).replace(/\/+$/, '')

  if (/^https?:\/\//i.test(s)) {
    // URL absolue : si elle contient un segment /storage/, on la rebase sur la
    // base courante (corrige les URLs enregistrées avec un mauvais host).
    const m = s.match(/\/storage\/(.*)$/i)
    if (m) {
      return `${base}/storage/${m[1].replace(/^\/+/, '')}`
    }
    // URL externe (placehold, loremflickr, CDN…) : on ne touche pas.
    return s
  }

  const normalized = s.replace(/^\/+/, '').replace(/^storage\/+/i, '')
  return `${base}/storage/${normalized}`
}

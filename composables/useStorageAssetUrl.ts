/**
 * URLs des fichiers publics Laravel (`storage/app/public/...`).
 * apiBase doit être comme `http://host/api` pour retirer le suffix /api puis ajouter `/storage/{path}`.
 */
export function resolveStorageAssetUrl(path: string | null | undefined): string {
  if (path == null || path === '') return ''
  const s = String(path).trim()
  if (/^https?:\/\//i.test(s)) return s
  const config = useRuntimeConfig()
  const api = String(config.public.apiBase ?? '').replace(/\/api\/?$/i, '')
  const slash = api.endsWith('/') ? '' : '/'
  const normalized = s.replace(/^\/+/, '').replace(/^storage\/+/i, '')
  return `${api}${slash}storage/${normalized}`
}

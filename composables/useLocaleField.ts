/**
 * Champs API multilingues (fr / en / zh) et slugs de paramètres globaux.
 */
export function useLocaleField() {
  const { locale } = useI18n()

  function field(
    obj: Record<string, unknown> | null | undefined,
    base: string,
  ): string {
    if (!obj) return ''
    const fr = obj[`${base}_fr`] ?? obj[`${base}Fr`]
    const en = obj[`${base}_en`] ?? obj[`${base}En`]
    const zh = obj[`${base}_zh`] ?? obj[`${base}Zh`]
    const loc = locale.value
    if (loc === 'zh') return String(zh || en || fr || '')
    if (loc === 'en') return String(en || fr || '')
    return String(fr || en || '')
  }

  function countryName(c: {
    name_fr?: string | null
    name_en?: string | null
    name_zh?: string | null
    label?: string | null
    code?: string | null
  }): string {
    const name = field(c as Record<string, unknown>, 'name')
    return name || c.label || c.code || ''
  }

  /** Slug global_settings : import_export_dest_heading_fr | _en | _zh */
  function globalSettingSlug(base: string): string {
    if (locale.value === 'en') return `${base}_en`
    if (locale.value === 'zh') return `${base}_zh`
    return `${base}_fr`
  }

  return { field, countryName, globalSettingSlug, locale }
}

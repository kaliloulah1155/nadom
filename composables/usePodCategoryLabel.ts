/**
 * Libellés des catégories produit (slug POD) : API multilingue, repli i18n `categories.pod.*`, puis label legacy.
 */
export function usePodCategoryLabel() {
  const { t, te, locale } = useI18n()
  const { label: categoryLabel } = useCategoryLabel()

  function label(cat: Record<string, unknown> | null | undefined): string {
    if (!cat) return ''
    const loc = locale.value
    const direct =
      loc === 'zh'
        ? cat.label_zh
        : loc === 'en'
          ? cat.label_en
          : cat.label_fr
    const trimmed = direct != null ? String(direct).trim() : ''
    if (trimmed) return trimmed

    const code = String(cat.code || '').trim().toLowerCase()
    if (code && te(`categories.pod.${code}`)) {
      return t(`categories.pod.${code}`)
    }

    return categoryLabel(cat)
  }

  return { label }
}

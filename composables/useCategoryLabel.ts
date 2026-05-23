/**
 * Libellés de catégories (API label_fr / label_en / label_zh) selon la locale i18n.
 */
export function useCategoryLabel() {
  const { field } = useLocaleField()
  const { locale } = useI18n()

  type Cat = Record<string, unknown> | null | undefined

  function label(cat: Cat): string {
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
    return field(cat, 'label') || String(cat.label || cat.code || '').trim()
  }

  return { label, categoryLabel: label }
}

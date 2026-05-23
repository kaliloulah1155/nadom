/**
 * Résout les listes i18n (tm) en chaînes affichables (rt).
 * Sans rt(), vue-i18n peut afficher l'AST JSON brut dans le template.
 */
export function useI18nResolved() {
  const { tm, rt } = useI18n()

  function resolveMsg(node: unknown): string {
    if (typeof node === 'string') return node
    if (node == null) return ''
    try {
      return rt(node as Parameters<typeof rt>[0])
    } catch {
      return ''
    }
  }

  function resolveList<K extends string>(
    key: string,
    fields: readonly K[],
  ): Record<K, string>[] {
    const raw = tm(key) as unknown
    if (!Array.isArray(raw)) return []
    return raw.map((item: Record<string, unknown>) => {
      const row = {} as Record<K, string>
      for (const field of fields) {
        row[field] = resolveMsg(item?.[field])
      }
      return row
    })
  }

  return { resolveMsg, resolveList }
}

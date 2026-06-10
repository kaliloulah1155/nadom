/**
 * Unité de facturation selon le mode d'expédition.
 *  - Bateau / maritime (`sea`)  → m³ (CBM, volume)
 *  - Aérien (`air_express`, `air_normal`) → kg (poids)
 *
 * Le champ stocké reste `cost_per_kg` côté API ; pour le bateau il représente
 * un coût par m³. Seule l'unité AFFICHÉE change.
 */
export type ShippingModeCode = 'air_express' | 'air_normal' | 'sea' | (string & {})

export function useShippingUnit() {
  /** Symbole d'unité (`kg` ou `m³`) pour un mode donné. */
  const unitForMode = (mode?: ShippingModeCode | null): 'kg' | 'm³' =>
    String(mode) === 'sea' ? 'm³' : 'kg'

  /** Vrai si le mode est facturé au volume (bateau). */
  const isVolumetric = (mode?: ShippingModeCode | null): boolean =>
    String(mode) === 'sea'

  return { unitForMode, isVolumetric }
}

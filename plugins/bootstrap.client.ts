// Charge Bootstrap depuis npm (deja en dependance) et l'expose sur window.
// Garantit que `(window as any).bootstrap` est defini AVANT que les
// composants n'appellent `new bootstrap.Modal(...)` dans leur onMounted —
// supprime la race condition avec le script CDN charge en bodyClose.
import * as bootstrap from 'bootstrap'

export default defineNuxtPlugin(() => {
  if (typeof window !== 'undefined') {
    ;(window as any).bootstrap = bootstrap
  }
})

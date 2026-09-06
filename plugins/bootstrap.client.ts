// Charge Bootstrap depuis npm (deja en dependance) et l'expose sur window.
// Garantit que `(window as any).bootstrap` est defini AVANT que les
// composants n'appellent `new bootstrap.Modal(...)` dans leur onMounted —
// supprime la race condition avec le script CDN charge en bodyClose.
import * as bootstrap from 'bootstrap'
import { useRouter } from 'vue-router'
import { nextTick } from 'vue'

export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return

  ;(window as any).bootstrap = bootstrap

  // Filet de securite : un backdrop de modale Bootstrap oublie dans le DOM
  // (navigation lancee avant la fin de l'animation de fermeture, ou le
  // `v-if` d'une modale qui demonte son contenu a un instant legerement
  // different de celui ou Bootstrap termine son propre cycle hide()) reste
  // invisible mais au-dessus de tout le reste de la page (z-index de modale)
  // — plus aucun clic ne passe nulle part sur la page suivante, y compris
  // sur un simple lien. Purge tout backdrop orphelin (aucune .modal.show
  // correspondante) a chaque navigation.
  const router = useRouter()
  router.afterEach(() => {
    nextTick(() => {
      if (document.querySelector('.modal.show')) return
      document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove())
      document.body.classList.remove('modal-open')
      document.body.style.removeProperty('overflow')
      document.body.style.removeProperty('padding-right')
    })
  })
})

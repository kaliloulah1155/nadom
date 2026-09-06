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

  // Bug connu (jackocnr/intl-tel-input#1704) : le piege a focus d'une modale
  // Bootstrap 5 renvoie de force le focus vers son propre contenu des qu'il
  // en sort — or le menu deroulant de PhoneInput (dropdownContainer:
  // document.body, cf. PhoneInput.vue) vit volontairement HORS du DOM de la
  // modale, pour echapper a son overflow. Consequence : impossible de
  // cliquer dans la recherche pays quand le champ telephone est dans une
  // modale (Envoi de colis, Personal Shopping...) — chaque focusin y est
  // immediatement recapture par la modale.
  //
  // Les listeners focusin (bulle, meme noeud document) s'executent dans
  // leur ordre d'ajout : celui-ci est enregistre au demarrage de l'app,
  // donc avant qu'aucune modale n'existe — il s'execute donc TOUJOURS avant
  // celui que Bootstrap ajoute plus tard (a l'ouverture d'une modale), et
  // stopImmediatePropagation() empeche ce dernier de rediriger le focus.
  // Le focus lui-meme est deja pose par le navigateur avant meme que cet
  // evenement ne se declenche : on bloque seulement la reaction de
  // Bootstrap, pas la prise de focus.
  document.addEventListener('focusin', (event) => {
    const target = event.target
    if (target instanceof Element && target.closest('.iti--container')) {
      event.stopImmediatePropagation()
    }
  })
})

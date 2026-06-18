/**
 * Wrapper SweetAlert2 (chargé dynamiquement côté client) pour remplacer
 * les confirm()/prompt()/alert() natifs.
 */
export function useSwal() {
  const load = async () => (await import('sweetalert2')).default

  const baseButtons = {
    confirmButtonColor: '#b8132e',
    cancelButtonColor: '#6c757d',
  }

  /** Boîte de confirmation. Renvoie true si l'utilisateur confirme. */
  async function confirm(options: {
    title?: string
    text?: string
    html?: string
    confirmButtonText?: string
    cancelButtonText?: string
    icon?: 'warning' | 'question' | 'info' | 'error' | 'success'
  } = {}): Promise<boolean> {
    const Swal = await load()
    const res = await Swal.fire({
      icon: options.icon ?? 'warning',
      title: options.title ?? 'Confirmer ?',
      text: options.text,
      html: options.html,
      showCancelButton: true,
      confirmButtonText: options.confirmButtonText ?? 'Confirmer',
      cancelButtonText: options.cancelButtonText ?? 'Annuler',
      reverseButtons: true,
      ...baseButtons,
    })
    return res.isConfirmed
  }

  /** Saisie texte. Renvoie la valeur (string, possiblement vide) ou null si annulé. */
  async function prompt(options: {
    title?: string
    text?: string
    inputLabel?: string
    inputPlaceholder?: string
    inputValue?: string
    confirmButtonText?: string
  } = {}): Promise<string | null> {
    const Swal = await load()
    const res = await Swal.fire({
      title: options.title ?? '',
      text: options.text,
      input: 'text',
      inputLabel: options.inputLabel,
      inputPlaceholder: options.inputPlaceholder,
      inputValue: options.inputValue ?? '',
      showCancelButton: true,
      confirmButtonText: options.confirmButtonText ?? 'Valider',
      cancelButtonText: 'Annuler',
      reverseButtons: true,
      ...baseButtons,
    })
    return res.isConfirmed ? (res.value ?? '') : null
  }

  /** Toast de succès (coin haut droit). */
  async function success(title: string, text?: string) {
    const Swal = await load()
    await Swal.fire({ icon: 'success', title, text, toast: true, position: 'top-end', timer: 3000, showConfirmButton: false, timerProgressBar: true })
  }

  /** Toast d'erreur. */
  async function error(title: string, text?: string) {
    const Swal = await load()
    await Swal.fire({ icon: 'error', title, text, toast: true, position: 'top-end', timer: 4500, showConfirmButton: false, timerProgressBar: true })
  }

  return { confirm, prompt, success, error, load }
}

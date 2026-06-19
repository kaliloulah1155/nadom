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

  /** Confirmation de suppression (rouge). Renvoie true si confirmé. */
  async function confirmDelete(message?: string): Promise<boolean> {
    const Swal = await load()
    const res = await Swal.fire({
      icon: 'warning',
      title: 'Supprimer ?',
      text: message || 'Cette action est irréversible.',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
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

  /**
   * Affiche un lien de paiement copiable dans une SweetAlert.
   * Bouton « Copier » + option « Envoyer via WhatsApp ».
   */
  async function paymentLink(options: { url: string; whatsappUrl?: string; amount?: string }) {
    const Swal = await load()
    const amountLine = options.amount
      ? `<p class="mb-2"><strong>Montant : ${options.amount}</strong></p>`
      : ''
    const res = await Swal.fire({
      icon: 'success',
      title: 'Lien de paiement généré',
      html: `
        ${amountLine}
        <p class="mb-2" style="font-size:13px;color:#6b7280;">Copiez le lien et envoyez-le au client :</p>
        <div style="display:flex;gap:6px;align-items:center;">
          <input id="swal-pay-link" readonly value="${options.url}"
            style="flex:1;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:12px;" />
          <button id="swal-copy-btn" type="button"
            style="padding:8px 12px;border:none;border-radius:8px;background:#b8132e;color:#fff;cursor:pointer;font-size:13px;white-space:nowrap;">
            Copier
          </button>
        </div>`,
      showCancelButton: true,
      confirmButtonText: options.whatsappUrl ? 'Envoyer via WhatsApp' : 'OK',
      cancelButtonText: 'Fermer',
      ...baseButtons,
      didOpen: () => {
        const btn = document.getElementById('swal-copy-btn')
        const input = document.getElementById('swal-pay-link') as HTMLInputElement | null
        btn?.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(options.url)
          } catch {
            input?.select()
            document.execCommand?.('copy')
          }
          btn.textContent = 'Copié ✓'
          btn.style.background = '#16a34a'
        })
      },
    })
    if (res.isConfirmed && options.whatsappUrl && typeof window !== 'undefined') {
      window.open(options.whatsappUrl, '_blank')
    }
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

  return { confirm, confirmDelete, prompt, paymentLink, success, error, load }
}

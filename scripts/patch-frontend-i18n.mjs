import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pagesDir = path.join(__dirname, '../pages')

const files = [
  'login.vue',
  'guide/index.vue',
  'contact-us.vue',
  'about-us.vue',
  'personal-shopping/index.vue',
  'personal-shopping/[id].vue',
  'visa/index.vue',
]

const replacements = [
  ["{{ locale === 'fr' ? 'Bienvenue sur NADOM' : 'Welcome to NADOM' }}", "{{ t('auth.welcome') }}"],
  ["{{ locale === 'fr' ? 'Votre partenaire de confiance pour l\\'import-export avec la Chine.' : 'Your trusted partner for import-export with China.' }}", "{{ t('auth.welcomeSubtitle') }}"],
  ["{{ locale === 'fr' ? 'Expedition securisee' : 'Secure shipping' }}", "{{ t('auth.secureShipping') }}"],
  ["{{ locale === 'fr' ? 'Suivi en temps reel' : 'Real-time tracking' }}", "{{ t('tracking.realTimeTracking') }}"],
  ["{{ locale === 'fr' ? 'Suivez votre commande' : 'Track your order' }}", "{{ t('auth.trackOrder') }}"],
  ["{{ locale === 'fr' ? 'Entrez votre code de suivi pour acceder a vos demandes et colis' : 'Enter your tracking code to access your requests and packages' }}", "{{ t('auth.trackOrderHint') }}"],
  [":placeholder=\"locale === 'fr' ? 'Ex: TRK-2024-001234 ou REQ-001234' : 'E.g., TRK-2024-001234 or REQ-001234'\"", ":placeholder=\"t('auth.trackingPlaceholder')\""],
  ["{{ locale === 'fr' ? 'Numero de suivi colis ou numero de demande' : 'Package tracking number or request number' }}", "{{ t('auth.trackingHint') }}"],
  ["{{ locale === 'fr' ? 'Pas de code ?' : 'No code?' }}", "{{ t('auth.noCode') }}"],
  [":placeholder=\"locale === 'fr' ? 'Votre mot de passe' : 'Your password'\"", ":placeholder=\"t('auth.passwordPlaceholder')\""],
  ["{{ locale === 'fr' ? 'Retour a l\\'accueil' : 'Back to home' }}", "{{ t('auth.backHome') }}"],
  ["locale.value === 'fr' ? 'Accès réservé au personnel autorisé' : 'Authorized personnel only'", "t('auth.staffOnly')"],
  ["locale.value === 'fr' ? 'Connexion reussie !' : 'Login successful!'", "t('auth.loginSuccess')"],
  ["locale.value === 'fr' ? 'Erreur lors de la connexion' : 'Login error'", "t('auth.loginError')"],
  ["{{ locale === 'fr' ? 'Aucun guide disponible' : 'No guide available' }}", "{{ t('guide.noGuide') }}"],
  ["{{ locale === 'fr' ? 'Contactez-nous pour plus d\\'informations.' : 'Contact us for more information.' }}", "{{ t('guide.contactInfo') }}"],
  ["{{ locale === 'fr' ? 'ans d\\'experience' : 'years experience' }}", "{{ t('guide.yearsExp') }}"],
  ["{{ locale === 'fr' ? 'A partir de' : 'From' }}", "{{ t('guide.from') }}"],
  ["{{ locale === 'fr' ? 'jour' : 'day' }}", "{{ t('guide.perDay') }}"],
  ["{{ locale === 'fr' ? 'Disponible' : 'Available' }}", "{{ t('guide.available') }}"],
  ["{{ locale === 'fr' ? 'Indisponible' : 'Unavailable' }}", "{{ t('guide.unavailable') }}"],
  ["{{ locale === 'fr' ? 'Aucun guide trouve' : 'No guide found' }}", "{{ t('guide.noGuideFound') }}"],
  ["{{ locale === 'fr' ? 'Modifiez vos filtres de recherche' : 'Adjust your search filters' }}", "{{ t('guide.adjustFilters') }}"],
  ["{{ locale === 'fr' ? 'Annuler' : 'Cancel' }}", "{{ t('common.cancel') }}"],
  ["locale.startsWith('fr')", "locale.value === 'fr'"],
  ["locale.value === 'fr' ? 'Merci de respecter les longueurs indiquées pour chaque champ.' : 'Please respect the maximum length shown for each field.'", "t('contact.fieldLengths')"],
  ["locale.startsWith('fr') ? 'Découvrir nos services' : 'Watch promo video'", "t('about.watchPromo')"],
  ["success(locale.value === 'fr' ? 'Produit ajouté au panier' : 'Product added to cart')", "success(t('cart.addedToCart'))"],
  ["success(locale.value === 'fr' ? 'Demande ajoutee au panier' : 'Request added to cart')", "success(t('cart.requestAdded'))"],
  ["{{ locale === 'fr' ? 'Aucun visa disponible' : 'No visa available' }}", "{{ t('visa.noVisa') }}"],
]

for (const rel of files) {
  const file = path.join(pagesDir, rel)
  if (!fs.existsSync(file)) continue
  let src = fs.readFileSync(file, 'utf8')
  let changed = false
  for (const [from, to] of replacements) {
    if (src.includes(from)) {
      src = src.split(from).join(to)
      changed = true
    }
  }
  if (changed && !src.includes('useI18n')) {
    const m = src.match(/<script setup[^>]*>/)
    if (m) {
      const hasT = src.includes("const { t")
      if (!hasT) {
        src = src.replace(m[0], `${m[0]}\nconst { t, locale } = useI18n()\n`)
      }
    }
  }
  if (changed) {
    fs.writeFileSync(file, src, 'utf8')
    console.log('Patched', rel)
  }
}

/**
 * Wires common hardcoded admin UI strings to t() — run: node scripts/wire-admin-i18n.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const adminDir = path.join(__dirname, '../pages/admin')

const replacements = [
  // Reset buttons
  ['<i class="bi bi-x-circle me-1"></i>Reset', "<i class=\"bi bi-x-circle me-1\"></i>{{ t('admin.common.reset') }}"],
  ['>Réinitialiser<', ">{{ t('admin.common.reset') }}<"],
  ['>Réinitialiser les filtres<', ">{{ t('admin.guideBookings.resetFilters') }}<"],
  ['title="Réinitialiser les dates"', ":title=\"t('admin.support.resetDates')\""],
  ['title="Réinitialiser"', ":title=\"t('admin.common.reset')\""],
  // Loading
  ['Chargement des utilisateurs...', "{{ t('admin.users.loading') }}"],
  ['>Chargement...<', ">{{ t('admin.common.loading') }}<"],
  // Common confirms
  ["confirm('Supprimer ce ticket ?')", "confirm(t('admin.confirm.deleteTicket'))"],
  ["confirm('Supprimer cette réservation ?')", "confirm(t('admin.confirm.deleteBooking'))"],
  ["confirm('Supprimer ce type de visa ?')", "confirm(t('admin.confirm.deleteGuide'))"], // reuse or fix
  ["confirm('Supprimer cet article ?')", "confirm(t('admin.confirm.deleteArticle'))"],
  ["confirm('Supprimer ce produit ?')", "confirm(t('admin.confirm.deleteProduct'))"],
  ["confirm('Supprimer ce guide ?')", "confirm(t('admin.confirm.deleteGuide'))"],
  ["confirm('Supprimer ce service ?')", "confirm(t('admin.confirm.deleteProduct'))"],
  ["confirm('Supprimer cette question ?')", "confirm(t('admin.confirm.deleteArticle'))"],
  ["confirm('Supprimer ce tarif ?')", "confirm(t('admin.confirm.deleteRate'))"],
  ["confirm('Supprimer ce lien ?')", "confirm(t('admin.confirm.deleteSocialLink'))"],
  ["confirm('Supprimer ce bloc ?')", "confirm(t('admin.confirm.deleteContactBlock'))"],
  // Toasts → messages
  ["success('Ticket modifié')", "success(t('admin.support.ticketUpdated'))"],
  ["success('Ticket créé')", "success(t('admin.support.ticketCreated'))"],
  ["success('Ticket supprimé')", "success(t('admin.support.ticketDeleted'))"],
  ["error('Choisissez un client ou une expédition.')", "error(t('admin.support.chooseClientOrShipment'))"],
  ["error(err.message || 'Erreur')", "error(err.message || t('admin.messages.genericError'))"],
  ["error('Erreur de chargement')", "error(t('admin.messages.loadError'))"],
  ["success('Demande supprimée')", "success(t('admin.contactLeads.deleted'))"],
  ["success('Statut mis à jour')", "success(t('admin.messages.statusUpdated'))"],
  ["success('Réservation supprimée')", "success(t('admin.guideBookings.deleted'))"],
  ["error('Mise à jour impossible')", "error(t('admin.messages.updateError'))"],
  ["error(e?.message || 'Suppression impossible')", "error(e?.message || t('admin.messages.deleteImpossible'))"],
  ["success('Utilisateur mis à jour avec succès')", "success(t('admin.users.updatedSuccess'))"],
  ["success('Utilisateur créé avec succès')", "success(t('admin.users.createdSuccess'))"],
  ["success('Utilisateur supprimé')", "success(t('admin.users.deletedSuccess'))"],
  ["error('Les mots de passe ne correspondent pas')", "error(t('admin.users.passwordMismatch'))"],
  ["error('Le mot de passe doit contenir au moins 8 caractères')", "error(t('admin.users.passwordMinLength'))"],
  ["error('Veuillez sélectionner un rôle')", "error(t('admin.users.selectRoleRequired'))"],
  // Modal titles patterns
  ["{{ editingTicket ? 'Modifier' : 'Nouveau' }} ticket", "{{ editingTicket ? t('admin.support.modalEdit') : t('admin.support.modalNew') }}"],
  ["{{ editingUser ? 'Modifier l\\'utilisateur' : 'Créer un nouvel utilisateur' }}", "{{ editingUser ? t('admin.users.modalEditUser') : t('admin.users.modalNewUser') }}"],
  ["{{ editingUser ? 'Mettre à jour' : 'Créer l\\'utilisateur' }}", "{{ editingUser ? t('admin.users.update') : t('admin.users.create') }}"],
  ['<p class="text-muted mb-0">Aucun produit trouvé</p>', '<p class="text-muted mb-0">{{ t(\'admin.products.noProducts\') }}</p>'],
  ['Chargement des services...', "{{ t('admin.pricing.loadingServices') }}"],
  ['<h5 class="mb-2">Aucun service configuré</h5>', '<h5 class="mb-2">{{ t(\'admin.pricing.noServices\') }}</h5>'],
  ['<i class="bi bi-plus-lg me-2"></i>Créer un service', '<i class="bi bi-plus-lg me-2"></i>{{ t(\'admin.pricing.createService\') }}'],
  ['<h5 class="mt-3">Aucun visa configuré</h5>', '<h5 class="mt-3">{{ t(\'admin.visas.noVisas\') }}</h5>'],
  ['<h5 class="mt-3">Aucun article</h5>', '<h5 class="mt-3">{{ t(\'admin.blog.noArticles\') }}</h5>'],
  ['<i class="bi bi-plus-lg me-2"></i>Créer un article', '<i class="bi bi-plus-lg me-2"></i>{{ t(\'admin.blog.createArticle\') }}'],
  ['<td colspan="8" class="text-center py-5 text-muted">Aucune destination</td>', '<td colspan="8" class="text-center py-5 text-muted">{{ t(\'admin.destinations.noDestinations\') }}</td>'],
  ['<td colspan="7" class="text-center py-4 text-muted">Aucun pays.</td>', '<td colspan="7" class="text-center py-4 text-muted">{{ t(\'admin.countries.noCountries\') }}</td>'],
  ['<h6>Aucune notification</h6>', '<h6>{{ t(\'admin.notifications.none\') }}</h6>'],
  ['<i class="bi bi-pencil me-2"></i>Modifier profil', '<i class="bi bi-pencil me-2"></i>{{ t(\'admin.users.editProfile\') }}'],
  ['<td colspan="4" class="text-center py-4 text-muted">Aucune demande</td>', '<td colspan="4" class="text-center py-4 text-muted">{{ t(\'admin.users.noUserRequests\') }}</td>'],
  ['<td colspan="4" class="text-center py-4 text-muted">Aucune expédition</td>', '<td colspan="4" class="text-center py-4 text-muted">{{ t(\'admin.users.noUserShipments\') }}</td>'],
  ['<td colspan="5" class="text-center py-4 text-muted">Aucun rôle trouvé</td>', '<td colspan="5" class="text-center py-4 text-muted">{{ t(\'admin.users.noRoles\') }}</td>'],
  ['placeholder="Nom, email, téléphone..."', ':placeholder="t(\'admin.users.searchPlaceholder\')"'],
  ['placeholder="Rechercher un produit..."', ':placeholder="t(\'admin.products.searchPlaceholder\')"'],
  ['<label class="form-label small text-muted mb-1">Recherche</label>', '<label class="form-label small text-muted mb-1">{{ t(\'admin.common.search\') }}</label>'],
  ['<option value="">Tous les types</option>', '<option value="">{{ t(\'admin.guides.allTypes\') }}</option>'],
  ['<option :value="undefined">Tous</option>', '<option :value="undefined">{{ t(\'admin.common.all\') }}</option>'],
]

function walk(dir) {
  const out = []
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) out.push(...walk(p))
    else if (ent.name.endsWith('.vue')) out.push(p)
  }
  return out
}

function ensureI18n(src) {
  if (src.includes('useI18n') || !src.includes("<script setup")) return src
  return src.replace(/<script setup[^>]*>\n/, (m) => `${m}const { t } = useI18n()\n\n`)
}

let total = 0
for (const file of walk(adminDir)) {
  let src = fs.readFileSync(file, 'utf8')
  let changed = false
  for (const [from, to] of replacements) {
    if (src.includes(from) && !src.includes(to)) {
      src = src.split(from).join(to)
      changed = true
    }
  }
  if (changed) {
    src = ensureI18n(src)
    fs.writeFileSync(file, src)
    total++
    console.log('patched', path.relative(adminDir, file))
  }
}
console.log(`Done. ${total} files updated.`)

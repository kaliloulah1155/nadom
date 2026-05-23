/**
 * Full i18n wiring for listed admin pages. Run: node scripts/wire-admin-pages-full.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '../pages/admin')

const globalReplacements = [
  ["success('Produit modifié')", "success(t('admin.products.updated'))"],
  ["success('Produit créé')", "success(t('admin.products.created'))"],
  ["success('Produit supprimé')", "success(t('admin.products.deleted'))"],
  ["error('L\\'image est trop lourde (max 2Mo)')", "error(t('admin.products.imageTooHeavy'))"],
  ["error('Erreur lors de l\\'upload de l\\'image')", "error(t('admin.products.uploadError'))"],
  ["error('Erreur lors de l\\'enregistrement')", "error(t('admin.messages.saveError'))"],
  ["success('Catégorie modifiée')", "success(t('admin.categories.updated'))"],
  ["success('Catégorie créée')", "success(t('admin.categories.created'))"],
  ["success('Catégorie supprimée')", "success(t('admin.categories.deleted'))"],
  ["error('Le slug est obligatoire')", "error(t('admin.categories.slugRequired'))"],
  ["if (confirm('Supprimer cette catégorie ?'))", "if (confirm(t('admin.confirm.deleteCategory')))"],
  ["success('Article modifié')", "success(t('admin.blog.updated'))"],
  ["success('Article créé')", "success(t('admin.blog.created'))"],
  ["success('Article supprimé')", "success(t('admin.blog.deleted'))"],
  ["success('Image téléversée')", "success(t('admin.messages.uploaded'))"],
  ["success('FAQ modifiée')", "success(t('admin.faq.updated'))"],
  ["success('FAQ créée')", "success(t('admin.faq.created'))"],
  ["success('FAQ supprimée')", "success(t('admin.faq.deleted'))"],
  ["success('Textes de la page Import-Export enregistrés.')", "success(t('admin.destinations.textsSaved'))"],
  ["notifyError('Choisissez un pays dans la liste.')", "notifyError(t('admin.destinations.selectCountryList'))"],
  ["success('Destination mise à jour')", "success(t('admin.destinations.updated'))"],
  ["success('Destination créée')", "success(t('admin.destinations.created'))"],
  ["success('Destination supprimée')", "success(t('admin.destinations.deleted'))"],
  ["success('Pays mis à jour')", "success(t('admin.countries.updated'))"],
  ["success('Pays créé')", "success(t('admin.countries.created'))"],
  ["success('Pays supprimé')", "success(t('admin.countries.deleted'))"],
  ["error(res.message || 'Impossible de charger les pays')", "error(res.message || t('admin.countries.loadFailed'))"],
  ["error(e.message || 'Erreur réseau')", "error(e.message || t('admin.countries.networkError'))"],
  ["error(res.message || 'Échec de la mise à jour')", "error(res.message || t('admin.countries.updateFailed'))"],
  ["error(res.message || 'Échec de la création')", "error(res.message || t('admin.countries.createFailed'))"],
  ["success('Tarif mis à jour')", "success(t('admin.shippingModes.updated'))"],
  ["success('Tarif créé')", "success(t('admin.shippingModes.created'))"],
  ["success('Tarif supprimé')", "success(t('admin.shippingModes.deleted'))"],
  ["success('Présentation enregistrée')", "success(t('admin.footerAdmin.presentationSaved'))"],
  ["success('Lien mis à jour')", "success(t('admin.footerAdmin.linkUpdated'))"],
  ["success('Lien créé')", "success(t('admin.footerAdmin.linkCreated'))"],
  ["success('Lien supprimé')", "success(t('admin.footerAdmin.linkDeleted'))"],
  ["success('Bloc mis à jour')", "success(t('admin.footerAdmin.blockUpdated'))"],
  ["success('Bloc créé')", "success(t('admin.footerAdmin.blockCreated'))"],
  ["success('Bloc supprimé')", "success(t('admin.footerAdmin.blockDeleted'))"],
  ["success('Carte mise à jour')", "success(t('admin.homeServices.updated'))"],
  ["success('Carte créée')", "success(t('admin.homeServices.created'))"],
  ["success('Carte supprimée')", "success(t('admin.homeServices.deleted'))"],
  ["notifyError(err.message || `Erreur export ${format}`)", "notifyError(err.message || t('admin.reports.exportError', { format }))"],
  ["error(err.message || 'Erreur')", "error(err.message || t('admin.messages.genericError'))"],
  ["error(e?.message || 'Erreur')", "error(e?.message || t('admin.messages.genericError'))"],
  ["notifyError(e.message || 'Erreur')", "notifyError(e.message || t('admin.messages.genericError'))"],
  ["title=\"Modifier\"", ":title=\"t('admin.common.edit')\""],
  ["title=\"Supprimer\"", ":title=\"t('admin.common.delete')\""],
  ['>Français<', ">{{ t('admin.common.french') }}<"],
  ['>English<', ">{{ t('admin.common.english') }}<"],
]

const fileReplacements = {
  'personal-shopping/index.vue': [
    ['<h4 class="mb-1">Personal Shopping</h4>', "<h4 class=\"mb-1\">{{ t('admin.personalShoppingHub.title') }}</h4>"],
    ['Accès rapide au catalogue boutique et aux demandes clients.', "{{ t('admin.personalShoppingHub.subtitle') }}"],
    ['<h5 class="mb-0 text-dark">Demandes</h5>', "<h5 class=\"mb-0 text-dark\">{{ t('admin.personalShoppingHub.requests') }}</h5>"],
    ['<small class="text-muted">Suivi des demandes PS</small>', "<small class=\"text-muted\">{{ t('admin.personalShoppingHub.trackPs') }}</small>"],
    ['<h5 class="mb-0 text-dark">Catégories</h5>', "<h5 class=\"mb-0 text-dark\">{{ t('admin.personalShoppingHub.categories') }}</h5>"],
    ['<small class="text-muted">Types de lignes catalogue</small>', "<small class=\"text-muted\">{{ t('admin.personalShoppingHub.catalogLines') }}</small>"],
    ['<h5 class="mb-0 text-dark">Produits</h5>', "<h5 class=\"mb-0 text-dark\">{{ t('admin.personalShoppingHub.products') }}</h5>"],
    ['<small class="text-muted">Fiches produits boutique</small>', "<small class=\"text-muted\">{{ t('admin.personalShoppingHub.productSheets') }}</small>"],
    ['Page vitrine', "{{ t('admin.personalShoppingHub.storefront') }}"],
    ['<small class="text-muted">Aperçu côté client</small>', "<small class=\"text-muted\">{{ t('admin.personalShoppingHub.clientPreview') }}</small>"],
  ],
  'faq/index.vue': [
    ['<p class="text-muted mb-0">{{ blogStore.faqMeta.total }} questions configurées</p>', "<p class=\"text-muted mb-0\">{{ t('admin.faq.totalCount', { n: blogStore.faqMeta.total }) }}</p>"],
    ['<i class="bi bi-plus-lg me-2"></i>Nouvelle question', "<i class=\"bi bi-plus-lg me-2\"></i>{{ t('admin.faq.newQuestion') }}"],
    ['<th style="width: 250px;">Catégorie</th>', "<th style=\"width: 250px;\">{{ t('admin.faq.category') }}</th>"],
    ['<th>Question</th>', "<th>{{ t('admin.faq.question') }}</th>"],
    ['<th>Actions</th>', "<th>{{ t('admin.common.actions') }}</th>"],
    ['Aucune question trouvée', "{{ t('admin.faq.noQuestions') }}"],
    ["{{ editingFaq ? 'Modifier' : 'Nouvelle' }} question", "{{ editingFaq ? t('admin.faq.modalEdit') : t('admin.faq.modalNew') }}"],
    ["if (confirm('Supprimer cette question ?'))", "if (confirm(t('admin.confirm.deleteArticle')))"],
  ],
  'blog/index.vue': [
    ['<i class="bi bi-plus-lg me-2"></i>Nouvel article', "<i class=\"bi bi-plus-lg me-2\"></i>{{ t('admin.blog.newArticle') }}"],
    ['<option :value="true">Publiés</option>', "<option :value=\"true\">{{ t('admin.blog.published') }}</option>"],
    ['<option :value="false">Brouillons</option>', "<option :value=\"false\">{{ t('admin.blog.drafts') }}</option>"],
    ['<i class="bi bi-pencil"></i> Modifier', "<i class=\"bi bi-pencil\"></i> {{ t('admin.common.edit') }}"],
    ['Commencez par créer votre premier article de blog.', "{{ t('admin.blog.createFirst') }}"],
    ["{{ editingPost ? 'Modifier' : 'Nouvel' }} article", "{{ editingPost ? t('admin.blog.modalEdit') : t('admin.blog.modalNew') }}"],
  ],
  'products/index.vue': [
    ['<label class="form-label small text-muted mb-1">Catégorie produit</label>', "<label class=\"form-label small text-muted mb-1\">{{ t('admin.products.category') }}</label>"],
    ['<option value="">Toutes les catégories</option>', "<option value=\"\">{{ t('admin.products.allCategories') }}</option>"],
    ['<label class="form-label small text-muted mb-1">Lignes / page</label>', "<label class=\"form-label small text-muted mb-1\">{{ t('admin.categories.linesPerPage') }}</label>"],
    ['<th class="px-4 py-3 border-0">Produit</th>', "<th class=\"px-4 py-3 border-0\">{{ t('admin.products.productCol') }}</th>"],
    ['<th class="py-3 border-0">Catégorie</th>', "<th class=\"py-3 border-0\">{{ t('admin.products.category') }}</th>"],
    ['<th class="py-3 border-0">Prix</th>', "<th class=\"py-3 border-0\">{{ t('admin.products.price') }}</th>"],
    ['<th class="py-3 border-0">Description</th>', "<th class=\"py-3 border-0\">{{ t('admin.products.description') }}</th>"],
    ['<th class="py-3 border-0 text-end px-4">Actions</th>', "<th class=\"py-3 border-0 text-end px-4\">{{ t('admin.common.actions') }}</th>"],
    ["{{ editingProduct ? 'Modifier' : 'Nouveau' }} produit", "{{ editingProduct ? t('admin.products.modalEdit') : t('admin.products.modalNew') }}"],
    ['<button type="button" class="nav-link active" data-bs-toggle="tab" data-bs-target="#prod-fr">Français</button>', '<button type="button" class="nav-link active" data-bs-toggle="tab" data-bs-target="#prod-fr">{{ t(\'admin.common.french\') }}</button>'],
    ['<button type="button" class="nav-link" data-bs-toggle="tab" data-bs-target="#prod-en">English</button>', '<button type="button" class="nav-link" data-bs-toggle="tab" data-bs-target="#prod-en">{{ t(\'admin.common.english\') }}</button>'],
  ],
  'categories/index.vue': [
    ['<p class="text-muted mb-0">{{ psStore.categoriesMeta.total }} catégories</p>', "<p class=\"text-muted mb-0\">{{ t('admin.categories.totalCount', { n: psStore.categoriesMeta.total }) }}</p>"],
    ['<i class="bi bi-plus-lg me-2"></i>Nouvelle catégorie', "<i class=\"bi bi-plus-lg me-2\"></i>{{ t('admin.categories.newCategory') }}"],
    ['<label class="form-label small text-muted mb-1">Filtrer par slug (type)</label>', "<label class=\"form-label small text-muted mb-1\">{{ t('admin.categories.filterSlug') }}</label>"],
    ['<option value="">— Tous les types —</option>', "<option value=\"\">{{ t('admin.categories.allTypes') }}</option>"],
    ['<th>Label</th>', "<th>{{ t('admin.users.label') }}</th>"],
    ['<th>Slug</th>', "<th>Slug</th>"],
    ['<th>Code</th>', "<th>{{ t('admin.users.code') }}</th>"],
    ['<th>Statut</th>', "<th>{{ t('admin.dashboard.status') }}</th>"],
    ['<th>Ordre</th>', "<th>{{ t('admin.categories.order') }}</th>"],
    ['<th>Actions</th>', "<th>{{ t('admin.common.actions') }}</th>"],
    ["{{ editingCategory ? 'Modifier' : 'Nouvelle' }} catégorie", "{{ editingCategory ? t('admin.categories.modalEdit') : t('admin.categories.modalNew') }}"],
  ],
  'destinations/index.vue': [
    ['<h4 class="mb-1">Destinations d\'expédition</h4>', "<h4 class=\"mb-1\">{{ t('admin.destinations.title') }}</h4>"],
    ['<i class="bi bi-box-arrow-up-right me-1"></i>Voir le calculateur', "<i class=\"bi bi-box-arrow-up-right me-1\"></i>{{ t('admin.destinations.viewCalculator') }}"],
    ['<i class="bi bi-plus-lg me-2"></i>Nouvelle destination', "<i class=\"bi bi-plus-lg me-2\"></i>{{ t('admin.destinations.newDestination') }}"],
    ['<label class="form-label small text-muted mb-1">Statut</label>', "<label class=\"form-label small text-muted mb-1\">{{ t('admin.dashboard.status') }}</label>"],
    ['<option value="">Toutes</option>', "<option value=\"\">{{ t('admin.common.allFeminine') }}</option>"],
    ['<option value="1">Actives</option>', "<option value=\"1\">{{ t('admin.common.active') }}</option>"],
    ['<option value="0">Inactives</option>', "<option value=\"0\">{{ t('admin.common.inactive') }}</option>"],
    ['<i class="bi bi-search me-1"></i>Filtrer', "<i class=\"bi bi-search me-1\"></i>{{ t('admin.common.filter') }}"],
    ['<th>Pays</th>', "<th>{{ t('admin.countries.country') }}</th>"],
    ['<th>Ville</th>', "<th>{{ t('admin.destinations.city') }}</th>"],
    ['<th>Continent</th>', "<th>{{ t('admin.destinations.continent') }}</th>"],
    ['<th>Drapeau</th>', "<th>{{ t('admin.destinations.flagEmoji') }}</th>"],
    ['<th>Devise</th>', "<th>{{ t('admin.products.currency') }}</th>"],
    ['<th>Modes</th>', "<th>{{ t('admin.shipments.mode') }}</th>"],
    ['<th class="text-end">Actions</th>', "<th class=\"text-end\">{{ t('admin.common.actions') }}</th>"],
    ["{{ editing ? 'Modifier' : 'Nouvelle' }} destination", "{{ editing ? t('admin.destinations.modalEdit') : t('admin.destinations.modalNew') }}"],
  ],
  'countries/index.vue': [
    ['<h4 class="mb-1">Pays (référentiel)</h4>', "<h4 class=\"mb-1\">{{ t('admin.countries.title') }}</h4>"],
    ['<i class="bi bi-plus-lg me-2"></i>Nouveau pays', "<i class=\"bi bi-plus-lg me-2\"></i>{{ t('admin.countries.newCountry') }}"],
    ['<th>Pays</th>', "<th>{{ t('admin.countries.country') }}</th>"],
    ['<th>Code</th>', "<th>{{ t('admin.countries.countryCode') }}</th>"],
    ['<th>Indicatif</th>', "<th>{{ t('admin.countries.dialCode') }}</th>"],
    ['<th>Devise</th>', "<th>{{ t('admin.products.currency') }}</th>"],
    ['<th class="text-center">Ordre</th>', "<th class=\"text-center\">{{ t('admin.countries.displayOrder') }}</th>"],
    ['Chargement…', "{{ t('admin.common.loading') }}"],
    ["{{ editing ? 'Modifier le pays' : 'Nouveau pays' }}", "{{ editing ? t('admin.countries.modalEdit') : t('admin.countries.modalNew') }}"],
  ],
  'shipping/modes/index.vue': [
    ["{{ editing ? 'Modifier' : 'Nouveau' }} tarif", "{{ editing ? t('admin.shippingModes.modalEdit') : t('admin.shippingModes.modalNew') }}"],
  ],
  'footer/index.vue': [
    ['<h4 class="mb-1">Pied de page (site public)</h4>', "<h4 class=\"mb-1\">{{ t('admin.footerAdmin.title') }}</h4>"],
    ['Texte d\'introduction, réseaux sociaux (liste), blocs contact (adresses, téléphones, e-mail).', "{{ t('admin.footerAdmin.subtitle') }}"],
    ['Texte sous le logo', "{{ t('admin.footerAdmin.textUnderLogo') }}"],
    ['Réseaux sociaux', "{{ t('admin.footerAdmin.socialNetworks') }}"],
    ['Blocs contact', "{{ t('admin.footerAdmin.contactBlocks') }}"],
    ['{{ savingSettings ? \'Enregistrement…\' : \'Enregistrer le texte\' }}', "{{ savingSettings ? t('admin.countries.saving') : t('admin.footerAdmin.saveText') }}"],
    ['<td colspan="6" class="text-center py-4 text-muted">Aucun lien configuré.</td>', '<td colspan="6" class="text-center py-4 text-muted">{{ t(\'admin.footerAdmin.noSocialLinks\') }}</td>'],
    ['<td colspan="5" class="text-center py-4 text-muted">Aucun bloc contact.</td>', '<td colspan="5" class="text-center py-4 text-muted">{{ t(\'admin.footerAdmin.noContactBlocks\') }}</td>'],
    ["{{ socEditing ? 'Modifier le lien' : 'Nouveau lien social' }}", "{{ socEditing ? t('admin.footerAdmin.editSocial') : t('admin.footerAdmin.newSocialLink') }}"],
    ["{{ cntEditing ? 'Modifier le bloc contact' : 'Nouveau bloc contact' }}", "{{ cntEditing ? t('admin.footerAdmin.editContactBlock') : t('admin.footerAdmin.newContactBlock') }}"],
  ],
  'home-services/index.vue': [
    ["{{ editing ? 'Modifier la carte' : 'Nouvelle carte' }}", "{{ editing ? t('admin.homeServices.editCard') : t('admin.homeServices.newCard') }}"],
    ['Aucun service — importez les données ou créez une carte.', "{{ t('admin.homeServices.noServices') }}"],
  ],
  'activity-logs/index.vue': [
    ['<i class="bi bi-arrow-clockwise me-1"></i>Actualiser', "<i class=\"bi bi-arrow-clockwise me-1\"></i>{{ t('admin.common.refresh') }}"],
    ['<label class="form-label small text-muted mb-1">Action</label>', "<label class=\"form-label small text-muted mb-1\">{{ t('admin.activityLogs.action') }}</label>"],
    ['<option value="">Toutes</option>', "<option value=\"\">{{ t('admin.common.allFeminine') }}</option>"],
    ['<option value="create">Création</option>', "<option value=\"create\">{{ t('admin.activityLogs.creation') }}</option>"],
    ['<option value="update">Modification</option>', "<option value=\"update\">{{ t('admin.activityLogs.modification') }}</option>"],
    ['<option value="delete">Suppression</option>', "<option value=\"delete\">{{ t('admin.activityLogs.deletion') }}</option>"],
    ['<label class="form-label small text-muted mb-1">Type d\'entité</label>', "<label class=\"form-label small text-muted mb-1\">{{ t('admin.activityLogs.entityType') }}</label>"],
    ['<label class="form-label small text-muted mb-1">Depuis</label>', "<label class=\"form-label small text-muted mb-1\">{{ t('admin.activityLogs.since') }}</label>"],
    ['<label class="form-label small text-muted mb-1">Jusqu\'à</label>', "<label class=\"form-label small text-muted mb-1\">{{ t('admin.activityLogs.until') }}</label>"],
    ['<th>Quand</th>', "<th>{{ t('admin.activityLogs.when') }}</th>"],
    ['<th>Qui</th>', "<th>{{ t('admin.activityLogs.who') }}</th>"],
    ['<th>Action</th>', "<th>{{ t('admin.activityLogs.action') }}</th>"],
    ['<th>Cible</th>', "<th>{{ t('admin.activityLogs.target') }}</th>"],
    ['<th>Navigateur</th>', "<th>{{ t('admin.activityLogs.browser') }}</th>"],
    ['<th class="text-end">Détails</th>', "<th class=\"text-end\">{{ t('admin.activityLogs.details') }}</th>"],
    ['<span v-else class="text-muted">Anonyme</span>', '<span v-else class="text-muted">{{ t(\'admin.common.anonymous\') }}</span>'],
    ['Aucune activité enregistrée pour le moment.', "{{ t('admin.activityLogs.noActivity') }}"],
    ['<h5 class="modal-title">Détail de l\'activité</h5>', "<h5 class=\"modal-title\">{{ t('admin.activityLogs.activityDetail') }}</h5>"],
    ['<dt class="col-sm-3">Date</dt>', "<dt class=\"col-sm-3\">{{ t('admin.shipments.date') }}</dt>"],
    ['<dt class="col-sm-3">Utilisateur</dt>', "<dt class=\"col-sm-3\">{{ t('admin.users.user') }}</dt>"],
    ['<dt class="col-sm-3">Entité</dt>', "<dt class=\"col-sm-3\">{{ t('admin.activityLogs.entity') }}</dt>"],
    ['<h6 class="mb-2">Données associées</h6>', "<h6 class=\"mb-2\">{{ t('admin.activityLogs.associatedData') }}</h6>"],
  ],
  'reports/index.vue': [
    ['<i class="bi bi-geo-alt text-primary"></i> Pays de livraison', "<i class=\"bi bi-geo-alt text-primary\"></i> {{ t('admin.reports.deliveryCountry') }}"],
    ['<option value="">{{ shippingStore.loadingDestinations ? \'Chargement…\' : \'🌍 Toutes destinations\' }}</option>', '<option value="">{{ shippingStore.loadingDestinations ? t(\'admin.common.loading\') : t(\'admin.reports.allDestinations\') }}</option>'],
    ['<i class="bi bi-calendar3 text-primary"></i> Année', "<i class=\"bi bi-calendar3 text-primary\"></i> {{ t('admin.reports.year') }}"],
    ['<i class="bi bi-calendar-range text-primary"></i> Période', "<i class=\"bi bi-calendar-range text-primary\"></i> {{ t('admin.reports.period') }}"],
    ['<option :value="12">12 derniers mois</option>', "<option :value=\"12\">{{ t('admin.reports.last12Months') }}</option>"],
    ['<option :value="6">6 derniers mois</option>', "<option :value=\"6\">{{ t('admin.reports.last6Months') }}</option>"],
    ['<option :value="3">3 derniers mois</option>', "<option :value=\"3\">{{ t('admin.reports.last3Months') }}</option>"],
    ['<option :value="1">Ce mois-ci</option>', "<option :value=\"1\">{{ t('admin.reports.thisMonth') }}</option>"],
    ["{{ reportsStore.statsLoading ? 'Chargement…' : 'Appliquer' }}", "{{ reportsStore.statsLoading ? t('admin.common.loading') : t('admin.common.apply') }}"],
  ],
  'support/index.vue': [
    ['<div v-else class="text-muted">Client #{{ ticket.user_id }}</div>', '<div v-else class="text-muted">{{ t(\'admin.support.clientFallback\', { id: ticket.user_id }) }}</div>'],
    ['<label class="form-label">Client concerné *</label>', "<label class=\"form-label\">{{ t('admin.support.clientRequired') }}</label>"],
    ['<option :value="0" disabled>Choisir un client…</option>', '<option :value="0" disabled>{{ t(\'admin.support.chooseClient\') }}</option>'],
    ['<i class="bi bi-link-45deg me-1"></i>Rattaché automatiquement à l\'expédition', "<i class=\"bi bi-link-45deg me-1\"></i>{{ t('admin.support.autoLinkedShipment') }}"],
    ['<label class="form-label">Contact e-mail</label>', "<label class=\"form-label\">{{ t('admin.support.contactEmail') }}</label>"],
    ['<label class="form-label">Contact téléphone</label>', "<label class=\"form-label\">{{ t('admin.support.contactPhone') }}</label>"],
    ['<label class="form-label">Sujet *</label>', "<label class=\"form-label\">{{ t('admin.support.subject') }} *</label>"],
    ['<label class="form-label">Description *</label>', "<label class=\"form-label\">{{ t('admin.support.description') }}</label>"],
    ['<label class="form-label">Catégorie</label>', "<label class=\"form-label\">{{ t('admin.support.category') }}</label>"],
    ['<option value="general">Général</option>', "<option value=\"general\">{{ t('admin.support.general') }}</option>"],
    ['<option value="technical">Technique</option>', "<option value=\"technical\">{{ t('admin.support.technical') }}</option>"],
    ['<option value="billing">Facturation</option>', "<option value=\"billing\">{{ t('admin.support.billing') }}</option>"],
    ['<option value="shipping">Expédition</option>', "<option value=\"shipping\">{{ t('admin.support.shippingCat') }}</option>"],
    ['<option value="other">Autre</option>', "<option value=\"other\">{{ t('admin.support.other') }}</option>"],
    ['<option value="open">Ouvert</option>', "<option value=\"open\">{{ t('admin.support.open') }}</option>"],
  ],
  'users/roles.vue': [
    ["{{ editingRole ? 'Modifier le rôle' : 'Nouveau rôle' }}", "{{ editingRole ? t('admin.users.modalEditRole') : t('admin.users.newRole') }}"],
    ["if (confirm(`Supprimer définitivement le rôle ${role.libelle} ?`))", "if (confirm(t('admin.users.confirmDeleteRole', { name: role.libelle })))"],
    ["success(editingRole.value ? 'Rôle mis à jour' : 'Rôle créé')", "success(editingRole.value ? t('admin.users.roleUpdated') : t('admin.users.roleCreated'))"],
    ["success('Permissions mises à jour avec succès')", "success(t('admin.users.permissionsUpdated'))"],
    ["success('Rôle supprimé')", "success(t('admin.users.roleDeleted'))"],
  ],
}

function ensureI18n(src) {
  if (src.includes('useI18n') || !src.includes('<script setup')) return src
  return src.replace(/<script setup[^>]*>\n/, (m) => `${m}const { t } = useI18n()\n\n`)
}

function patchFile(relPath) {
  const full = path.join(root, relPath)
  if (!fs.existsSync(full)) return false
  let src = fs.readFileSync(full, 'utf8')
  let changed = false
  const reps = [...globalReplacements, ...(fileReplacements[relPath] || [])]
  for (const [from, to] of reps) {
    if (src.includes(from) && !src.includes(to)) {
      src = src.split(from).join(to)
      changed = true
    }
  }
  if (changed) {
    src = ensureI18n(src)
    fs.writeFileSync(full, src)
    return true
  }
  return false
}

const targets = Object.keys(fileReplacements)
let n = 0
for (const rel of targets) {
  if (patchFile(rel)) {
    console.log('ok', rel)
    n++
  }
}
// Also run global on all admin vue
for (const rel of fs.readdirSync(root, { recursive: true })) {
  if (typeof rel !== 'string' || !rel.endsWith('.vue')) continue
  const p = path.join(root, rel)
  let src = fs.readFileSync(p, 'utf8')
  let changed = false
  for (const [from, to] of globalReplacements) {
    if (src.includes(from) && !src.includes(to)) {
      src = src.split(from).join(to)
      changed = true
    }
  }
  if (changed) {
    src = ensureI18n(src)
    fs.writeFileSync(p, src)
    console.log('global', rel)
    n++
  }
}
console.log(`Patched ${n} file(s)`)

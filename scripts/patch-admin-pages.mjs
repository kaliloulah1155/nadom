/**
 * Patches admin Vue pages: inject useI18n and replace common UI strings with t().
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const adminDir = path.join(__dirname, '../pages/admin')

const replacements = [
  ['Gestion des demandes', "{{ t('admin.requests.title') }}"],
  ['Nouvelle demande', "{{ t('admin.requests.newRequest') }}"],
  ['Gestion des expéditions', "{{ t('admin.shipments.title') }}"],
  ['Gestion des expeditions', "{{ t('admin.shipments.title') }}"],
  ['Nouvelle expédition', "{{ t('admin.shipments.newShipment') }}"],
  ['Tableau de bord', "{{ t('admin.dashboard.title') }}"],
  ["Résumé de l'activité NADOM.", "{{ t('admin.dashboard.subtitle') }}"],
  ['Demandes enregistrées', "{{ t('admin.dashboard.registeredRequests') }}"],
  ['Demandes en attente', "{{ t('admin.dashboard.pendingRequests') }}"],
  ['Colis en transit', "{{ t('admin.dashboard.inTransitPackages') }}"],
  ['Devis facturés', "{{ t('admin.dashboard.invoicedQuotes') }}"],
  ['Demandes récentes', "{{ t('admin.dashboard.recentRequests') }}"],
  ['Voir tout', "{{ t('admin.dashboard.viewAll') }}"],
  ['Répartition des statuts', "{{ t('admin.dashboard.statusDistribution') }}"],
  ['Aucune donnée', "{{ t('admin.dashboard.noData') }}"],
  ['Aucun colis en transit', "{{ t('admin.dashboard.noTransitPackages') }}"],
  ['Actions rapides', "{{ t('admin.dashboard.quickActions') }}"],
  ['Support client', "{{ t('admin.support.title') }}"],
  ['Nouveau ticket', "{{ t('admin.support.newTicket') }}"],
  ['Rapports & Statistiques', "{{ t('admin.reports.title') }}"],
  ['Analyse des performances et activités', "{{ t('admin.reports.subtitle') }}"],
  ['Exporter PDF', "{{ t('admin.common.exportPdf') }}"],
  ['Exporter Excel', "{{ t('admin.common.exportExcel') }}"],
  ['Gestion des utilisateurs', "{{ t('admin.users.title') }}"],
  ['Nouvel utilisateur', "{{ t('admin.users.newUser') }}"],
  ['Mon profil', "{{ t('admin.profile.title') }}"],
  ['Gestion des produits', "{{ t('admin.products.title') }}"],
  ['Nouveau produit', "{{ t('admin.products.newProduct') }}"],
  ['Gestion du blog', "{{ t('admin.blog.title') }}"],
  ['Gestion de la FAQ', "{{ t('admin.faq.title') }}"],
  ['Gestion des catégories', "{{ t('admin.categories.title') }}"],
  ['Gestion des guides', "{{ t('admin.guides.title') }}"],
  ['Gestion des visas', "{{ t('admin.visas.title') }}"],
  ['Paramètres globaux', "{{ t('admin.settings.title') }}"],
  ["Journal d'activité", "{{ t('admin.activityLogs.title') }}"],
  ['>Annuler<', ">{{ t('admin.common.cancel') }}<"],
  ['>Enregistrer<', ">{{ t('admin.common.save') }}<"],
  ['>Fermer<', ">{{ t('admin.common.close') }}<"],
  ['>Modifier<', ">{{ t('admin.common.edit') }}<"],
  ['>Supprimer<', ">{{ t('admin.common.delete') }}<"],
  ['>Rechercher<', ">{{ t('admin.common.search') }}<"],
  ['>Réinitialiser<', ">{{ t('admin.common.reset') }}<"],
  ['>Actualiser<', ">{{ t('admin.common.refresh') }}<"],
  ["confirm('Supprimer cette demande ?')", "confirm(t('admin.confirm.deleteRequest'))"],
  ["confirm(\"Supprimer cette demande ?\")", "confirm(t('admin.confirm.deleteRequest'))"],
  ['placeholder="Rechercher..."', ':placeholder="t(\'admin.requests.searchPlaceholder\')"'],
  ['>Tous les statuts<', ">{{ t('admin.requests.allStatuses') }}<"],
  ['>En attente<', ">{{ t('admin.requests.status.pending') }}<"],
  ['>Total<', ">{{ t('admin.dashboard.total') }}<"],
  ['>Revenus<', ">{{ t('admin.dashboard.revenue') }}<"],
  ['>Transit<', ">{{ t('admin.dashboard.transit') }}<"],
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

for (const file of walk(adminDir)) {
  let src = fs.readFileSync(file, 'utf8')
  let changed = false
  for (const [from, to] of replacements) {
    if (src.includes(from) && !src.includes(to)) {
      src = src.split(from).join(to)
      changed = true
    }
  }
  if (!src.includes('useI18n')) {
    const scriptMatch = src.match(/<script setup[^>]*>/)
    if (scriptMatch) {
      src = src.replace(scriptMatch[0], `${scriptMatch[0]}\nconst { t } = useI18n()\n`)
      changed = true
    }
  }
  if (changed) {
    fs.writeFileSync(file, src, 'utf8')
    console.log('Patched', path.relative(adminDir, file))
  }
}

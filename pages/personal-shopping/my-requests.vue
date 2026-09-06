<template>
  <div>
    <div class="mb-4">
      <h2 class="mb-1">{{ t('clientArea.myRequestsTitle') }}</h2>
      <p class="text-muted mb-0">{{ t('clientArea.myRequestsSubtitle') }}</p>
    </div>

    <!-- Onglets : chaque nature de demande a sa liste. -->
    <ul class="nav nav-pills mb-4 flex-wrap gap-2">
      <li v-for="o in onglets" :key="o.cle" class="nav-item">
        <button
          type="button"
          class="nav-link"
          :class="{ active: ongletActif === o.cle }"
          @click="changerOnglet(o.cle)"
        >
          <i :class="o.icone" class="me-1"></i>{{ t(o.libelle) }}
        </button>
      </li>
    </ul>

    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <div v-if="chargement" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>

        <div v-else-if="erreur" class="text-center py-5 text-danger">
          <i class="bi bi-exclamation-triangle display-6 d-block mb-2"></i>
          {{ t('clientArea.loadError') }}
        </div>

        <div v-else-if="lignes.length === 0" class="text-center py-5 text-muted">
          <i class="bi bi-inbox display-6 d-block mb-2"></i>
          {{ t('clientArea.noRecords') }}
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th v-for="c in colonnes" :key="c.cle" :class="c.classe">{{ t(c.libelle) }}</th>
                <th class="text-end">{{ t('clientArea.action') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="l in lignes" :key="l.id">
                <td v-for="c in colonnes" :key="c.cle" :class="c.classe">
                  <span v-if="c.cle === 'statut'" class="badge" :class="classeStatut(l.statut)">
                    {{ l.statutLibelle }}
                  </span>
                  <span v-else>{{ l[c.cle] || '—' }}</span>
                </td>
                <td class="text-end">
                  <NuxtLink v-if="l.lien" :to="l.lien" class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-eye"></i>
                  </NuxtLink>
                  <span v-else class="text-muted small">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <AdminPagination
          v-if="!chargement && total > 0"
          :total-items="total"
          :current-page="page"
          :limit="limite"
          @update:current-page="(p: number) => charger(p, limite)"
          @update:limit="(l: number) => charger(1, l)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminPagination from '~/components/admin/AdminPagination.vue'
import { useApi } from '~/composables/useApi'
import { useAuthStore } from '~/stores/auth'
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({
  layout: 'client',
  middleware: ['auth'],
})

const { t } = useI18n()
const api = useApi()
const authStore = useAuthStore()
const { formatCurrency, formatDate } = useFormatters()

type Cle = 'envois' | 'shopping' | 'guide' | 'visa'

const onglets: { cle: Cle; libelle: string; icone: string }[] = [
  { cle: 'envois', libelle: 'clientArea.tabShipments', icone: 'bi bi-box-seam' },
  { cle: 'shopping', libelle: 'clientArea.tabShopping', icone: 'bi bi-bag-heart' },
  { cle: 'guide', libelle: 'clientArea.tabGuide', icone: 'bi bi-person-badge' },
  { cle: 'visa', libelle: 'clientArea.tabVisa', icone: 'bi bi-passport' },
]

const ongletActif = ref<Cle>('envois')
const chargement = ref(true)
const erreur = ref(false)
const lignes = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const limite = ref(10)

const colonnes = computed(() => {
  if (ongletActif.value === 'guide') {
    return [
      { cle: 'reference', libelle: 'clientArea.colReference', classe: '' },
      { cle: 'objet', libelle: 'clientArea.colGuide', classe: '' },
      { cle: 'statut', libelle: 'clientArea.colStatus', classe: '' },
      { cle: 'date', libelle: 'clientArea.colDate', classe: '' },
    ]
  }
  if (ongletActif.value === 'visa') {
    return [
      { cle: 'reference', libelle: 'clientArea.colReference', classe: '' },
      { cle: 'objet', libelle: 'clientArea.colVisaType', classe: '' },
      { cle: 'statut', libelle: 'clientArea.colStatus', classe: '' },
      { cle: 'date', libelle: 'clientArea.colDate', classe: '' },
    ]
  }
  return [
    { cle: 'reference', libelle: 'clientArea.colReference', classe: '' },
    { cle: 'objet', libelle: 'clientArea.colSubject', classe: '' },
    { cle: 'statut', libelle: 'clientArea.colStatus', classe: '' },
    { cle: 'montant', libelle: 'clientArea.colAmount', classe: 'text-end' },
    { cle: 'date', libelle: 'clientArea.colDate', classe: '' },
  ]
})

const classeStatut = (s: string) => {
  if (['delivered', 'confirmed', 'approved', 'completed'].includes(s)) return 'bg-success-subtle text-success'
  if (['cancelled', 'rejected', 'failed'].includes(s)) return 'bg-danger-subtle text-danger'
  if (['pending'].includes(s)) return 'bg-warning-subtle text-warning'
  return 'bg-secondary-subtle text-secondary'
}

/** Le back-office renvoie tantôt un paginateur, tantôt un tableau simple. */
const extraire = (d: any) => {
  if (Array.isArray(d)) return { items: d, total: d.length }
  if (d && Array.isArray(d.data)) return { items: d.data, total: d.total ?? d.data.length }
  return { items: [], total: 0 }
}

const charger = async (p = 1, l = limite.value) => {
  chargement.value = true
  erreur.value = false
  page.value = p
  limite.value = l
  try {
    // L'API restreint déjà un utilisateur non-staff à ses propres enregistrements :
    // inutile (et moins sûr) de lui faire envoyer un `user_id`. On s'assure en
    // revanche que la session est chargée, sinon l'appel partirait sans jeton.
    if (!authStore.isAuthenticated) await authStore.initializeAuth()

    if (ongletActif.value === 'envois' || ongletActif.value === 'shopping') {
      const res = await api.post<any>('/personal-shopping-requests/all', {
        page: p,
        limit: l,
        request_type: ongletActif.value === 'envois' ? 'package_sending' : 'personal_shopping',
      }, { query: { page: p, limit: l } })
      const { items, total: n } = extraire(res.data)
      total.value = n
      lignes.value = items.map((r: any) => ({
        id: r.id,
        reference: r.tracking_number ?? r.trackingNumber ?? String(r.id).slice(-6),
        objet: r.title || r.description || t('clientArea.parcel'),
        statut: r.status,
        statutLibelle: t('admin.requests.status.' + r.status, r.status),
        montant: r.quoted_price ? formatCurrency(Number(r.quoted_price), (r.currency || 'XOF').toUpperCase()) : '—',
        date: formatDate(r.created_at ?? r.createdAt),
        lien: `/personal-shopping/${r.id}`,
      }))
    } else if (ongletActif.value === 'guide') {
      const res = await api.get<any>('/guide-bookings', { query: { page: p, limit: l } })
      const { items, total: n } = extraire(res.data)
      total.value = n
      lignes.value = items.map((r: any) => ({
        id: r.id,
        reference: String(r.id).slice(-6),
        objet: r.guide?.name || r.guide?.fullname || '—',
        statut: r.status,
        statutLibelle: r.status,
        date: formatDate(r.created_at),
        lien: '',
      }))
    } else {
      const res = await api.get<any>('/visa-applications/mine', { query: { page: p, limit: l } })
      const { items, total: n } = extraire(res.data)
      total.value = n
      lignes.value = items.map((r: any) => ({
        id: r.id,
        reference: String(r.id).slice(-6),
        objet: r.visa_type?.label || r.visaType?.label || '—',
        statut: r.status,
        statutLibelle: r.status,
        date: formatDate(r.created_at),
        lien: '',
      }))
    }
  } catch (e) {
    // Une liste vide par erreur ne doit pas ressembler à une liste vide légitime.
    erreur.value = true
    lignes.value = []
    total.value = 0
  } finally {
    chargement.value = false
  }
}

const changerOnglet = (c: Cle) => {
  if (c === ongletActif.value) return
  ongletActif.value = c
  charger(1, limite.value)
}

onMounted(() => charger(1, limite.value))
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <!-- Not Found -->
    <div v-else-if="!request" class="text-center py-5">
      <h4>Demande non trouvee</h4>
      <NuxtLink to="/admin/requests" class="btn btn-primary">Retour</NuxtLink>
    </div>

    <!-- Request Detail -->
    <div v-else>
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <NuxtLink to="/admin/requests" class="btn btn-link p-0 mb-2">
            <i class="bi bi-arrow-left me-1"></i>Retour
          </NuxtLink>
          <h4 class="mb-0">Demande #{{ request.id.slice(-6) }}</h4>
        </div>
        <div class="d-flex gap-2">
          <select
            :value="request.status"
            class="form-select"
            @change="updateStatus(($event.target as HTMLSelectElement).value)"
          >
            <option value="pending">En attente</option>
            <option value="searching">Recherche</option>
            <option value="negotiating">Negociation</option>
            <option value="confirmed">Confirme</option>
            <option value="preparing">Preparation</option>
            <option value="shipped">Expedie</option>
            <option value="delivered">Livre</option>
            <option value="cancelled">Annule</option>
          </select>
        </div>
      </div>

      <div class="row g-4">
        <!-- Main Content -->
        <div class="col-lg-8">
          <!-- Product Info -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-transparent">
              <h5 class="mb-0">Informations produit</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4">
                  <img
                    :src="request.images[0] || 'https://via.placeholder.com/200'"
                    class="img-fluid rounded"
                  />
                  <div v-if="request.images.length > 1" class="d-flex gap-2 mt-2">
                    <img
                      v-for="(img, i) in request.images.slice(1, 4)"
                      :key="i"
                      :src="img"
                      class="rounded"
                      width="50"
                      height="50"
                      style="object-fit: cover;"
                    />
                  </div>
                </div>
                <div class="col-md-8">
                  <h5>{{ request.title }}</h5>
                  <span class="badge bg-secondary mb-3">{{ request.category }}</span>
                  <p class="text-muted">{{ request.description }}</p>
                  <div class="row g-2">
                    <div class="col-6">
                      <small class="text-muted d-block">Quantite</small>
                      <strong>{{ request.quantity }}</strong>
                    </div>
                    <div class="col-6">
                      <small class="text-muted d-block">Budget estime</small>
                      <strong>{{ formatCurrency(request.budgetEstimated) }}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quotation -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-transparent d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Devis</h5>
              <button
                v-if="!showQuotationForm && !request.quotedPrice"
                class="btn btn-sm btn-primary"
                @click="showQuotationForm = true"
              >
                <i class="bi bi-plus me-1"></i>Creer devis
              </button>
            </div>
            <div class="card-body">
              <!-- Existing Quotation -->
              <div v-if="request.quotedPrice && request.quotedDetails">
                <table class="table table-sm">
                  <tbody>
                    <tr>
                      <td>Cout produit</td>
                      <td class="text-end">{{ formatCurrency(request.quotedDetails.productCost) }}</td>
                    </tr>
                    <tr>
                      <td>Commission (5%)</td>
                      <td class="text-end">{{ formatCurrency(request.quotedDetails.serviceFee) }}</td>
                    </tr>
                    <tr>
                      <td>Inspection</td>
                      <td class="text-end">{{ formatCurrency(request.quotedDetails.inspectionFee) }}</td>
                    </tr>
                    <tr>
                      <td>Emballage</td>
                      <td class="text-end">{{ formatCurrency(request.quotedDetails.packagingFee) }}</td>
                    </tr>
                    <tr>
                      <td>Expedition</td>
                      <td class="text-end">{{ formatCurrency(request.quotedDetails.shippingCost) }}</td>
                    </tr>
                    <tr class="fw-bold border-top">
                      <td>TOTAL</td>
                      <td class="text-end text-success">{{ formatCurrency(request.quotedPrice) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Quotation Form -->
              <form v-else-if="showQuotationForm" @submit.prevent="submitQuotation">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Cout produit (FCFA)</label>
                    <input v-model.number="quotation.productCost" type="number" class="form-control" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Inspection (FCFA)</label>
                    <input v-model.number="quotation.inspectionFee" type="number" class="form-control" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Emballage (FCFA)</label>
                    <input v-model.number="quotation.packagingFee" type="number" class="form-control" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Expedition (FCFA)</label>
                    <input v-model.number="quotation.shippingCost" type="number" class="form-control" required />
                  </div>
                </div>

                <div class="alert alert-info mt-3">
                  <strong>Total estime :</strong> {{ formatCurrency(quotationTotal) }}
                  <small class="d-block">(Commission 5% incluse)</small>
                </div>

                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-success">
                    <i class="bi bi-check me-1"></i>Enregistrer
                  </button>
                  <button type="button" class="btn btn-outline-secondary" @click="showQuotationForm = false">
                    Annuler
                  </button>
                </div>
              </form>

              <div v-else class="text-center py-3 text-muted">
                Aucun devis cree
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
          <!-- Status -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body">
              <h6 class="mb-3">Statut actuel</h6>
              <span
                class="badge fs-6"
                :style="{
                  backgroundColor: formatRequestStatus(request.status).bgColor,
                  color: formatRequestStatus(request.status).color
                }"
              >
                {{ formatRequestStatus(request.status).label }}
              </span>
            </div>
          </div>

          <!-- Info -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body">
              <h6 class="mb-3">Informations</h6>
              <div class="mb-2">
                <small class="text-muted d-block">Client ID</small>
                <code>{{ request.userId }}</code>
              </div>
              <div class="mb-2">
                <small class="text-muted d-block">Creee le</small>
                <span>{{ formatDate(request.createdAt) }}</span>
              </div>
              <div class="mb-2">
                <small class="text-muted d-block">Mise a jour</small>
                <span>{{ formatDate(request.updatedAt) }}</span>
              </div>
              <div>
                <small class="text-muted d-block">Messages WhatsApp</small>
                <span>{{ request.whatsappMessages }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h6 class="mb-3">Actions</h6>
              <div class="d-grid gap-2">
                <a href="#" class="btn btn-success" @click.prevent="openWhatsApp">
                  <i class="bi bi-whatsapp me-2"></i>Contacter client
                </a>
                <button class="btn btn-outline-danger" @click="deleteRequest">
                  <i class="bi bi-trash me-2"></i>Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { usePersonalShoppingStore, type RequestStatus } from '~/stores/personalShopping'
import { useFormatters } from '~/composables/useFormatters'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const psStore = usePersonalShoppingStore()
const { formatCurrency, formatDate, formatRequestStatus } = useFormatters()
const { success, error: notifyError } = useNotification()

const loading = ref(true)
const showQuotationForm = ref(false)

const quotation = reactive({
  productCost: 0,
  inspectionFee: 5000,
  packagingFee: 3000,
  shippingCost: 0
})

const requestId = route.params.id as string

onMounted(async () => {
  await psStore.fetchRequests()
  loading.value = false
})

const request = computed(() => psStore.getRequestById(requestId))

const quotationTotal = computed(() => {
  const subtotal = quotation.productCost + quotation.inspectionFee + quotation.packagingFee + quotation.shippingCost
  const serviceFee = quotation.productCost * 0.05
  return subtotal + serviceFee
})

const updateStatus = async (status: string) => {
  try {
    await psStore.updateRequestStatus(requestId, status as RequestStatus)
    success('Statut mis a jour')
  } catch (err) {
    notifyError('Erreur')
  }
}

const submitQuotation = async () => {
  const serviceFee = quotation.productCost * 0.05

  const quotedDetails = {
    productCost: quotation.productCost,
    serviceFee,
    inspectionFee: quotation.inspectionFee,
    packagingFee: quotation.packagingFee,
    shippingCost: quotation.shippingCost,
    totalPrice: quotationTotal.value
  }

  try {
    await psStore.addQuotation(requestId, quotationTotal.value, quotedDetails)
    showQuotationForm.value = false
    success('Devis cree')
  } catch (err) {
    notifyError('Erreur')
  }
}

const openWhatsApp = () => {
  if (request.value) {
    window.open(`https://wa.me/?text=Bonjour, concernant votre demande ${request.value.id}`, '_blank')
  }
}

const deleteRequest = async () => {
  if (!confirm('Supprimer cette demande ?')) return

  try {
    await psStore.deleteRequest(requestId)
    success('Demande supprimee')
    router.push('/admin/requests')
  } catch (err) {
    notifyError('Erreur')
  }
}
</script>

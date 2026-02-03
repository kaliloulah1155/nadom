<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Support client</h4>
        <p class="text-muted mb-0">Gestion des messages et demandes d'assistance</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary" @click="openSettings()">
          <i class="bi bi-gear me-2"></i>Paramètres support
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="row g-4 mb-4">
      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h6 class="text-muted small mb-1">Total messages</h6>
            <h3 class="mb-0">128</h3>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm border-start border-warning border-4">
          <div class="card-body">
            <h6 class="text-muted small mb-1">En attente</h6>
            <h3 class="mb-0 text-warning">12</h3>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm border-start border-success border-4">
          <div class="card-body">
            <h6 class="text-muted small mb-1">Résolus</h6>
            <h3 class="mb-0 text-success">116</h3>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm border-start border-info border-4">
          <div class="card-body">
            <h6 class="text-muted small mb-1">Temps moyen rép.</h6>
            <h3 class="mb-0 text-info">2.4h</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages Table -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Client</th>
                <th>Sujet</th>
                <th>Priorité</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Placeholder data as there's no FAKE_SUPPORT -->
              <tr v-for="i in 5" :key="i">
                <td>
                  <div class="fw-medium">Client #{{ 1000 + i }}</div>
                  <small class="text-muted">client{{ i }}@example.com</small>
                </td>
                <td>
                  <div class="text-truncate" style="max-width: 300px;">
                    Problème avec ma commande #TRK-123{{ i }}
                  </div>
                </td>
                <td>
                  <span class="badge" :class="i % 3 === 0 ? 'bg-danger-subtle text-danger' : 'bg-info-subtle text-info'">
                    {{ i % 3 === 0 ? 'Haute' : 'Normale' }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="i % 2 === 0 ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success'">
                    {{ i % 2 === 0 ? 'En attente' : 'Fermé' }}
                  </span>
                </td>
                <td><small>02/02/2026</small></td>
                <td>
                  <button class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-reply me-1"></i>Répondre
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination Dummy -->
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          v-model:current-page="currentPage"
          v-model:limit="perPage"
          :total-items="128"
        />
      </div>
    </div>

    <!-- Settings Modal -->
    <div class="modal fade" id="settingsModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Paramètres du support</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Email de support</label>
              <input type="email" class="form-control" value="support@nadom.ci" />
            </div>
            <div class="mb-3">
              <label class="form-label">Délai de réponse moyen (h)</label>
              <input type="number" class="form-control" value="2.4" />
            </div>
            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" checked id="autoReply">
              <label class="form-check-label" for="autoReply">Réponse automatique activée</label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary btn-md me-2" data-bs-dismiss="modal">Fermer</button>
            <button type="button" class="btn btn-primary btn-md" data-bs-dismiss="modal">Enregistrer</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

const currentPage = ref(1)
const perPage = ref(10)

const modalRef = ref<HTMLElement | null>(null)
let modalInstance: any = null

onMounted(() => {
  if (typeof window !== 'undefined' && (window as any).bootstrap) {
    modalInstance = new (window as any).bootstrap.Modal(modalRef.value)
  }
})

const openSettings = () => {
  modalInstance?.show()
}
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div>
        <h4 class="mb-1">{{ t('admin.addressBook.title') }}</h4>
        <p class="text-muted mb-0">{{ t('admin.addressBook.subtitle') }}</p>
      </div>
    </div>

    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-8">
            <label class="form-label small text-muted mb-1">{{ t('admin.addressBook.search') }}</label>
            <input
              v-model="filters.search"
              type="text"
              class="form-control"
              :placeholder="t('admin.addressBook.searchHint')"
              @input="debouncedFetch"
            />
          </div>
          <div class="col-md-4">
            <button type="button" class="btn btn-outline-secondary" :disabled="!filters.search" @click="clearSearch">
              {{ t('admin.common.reset') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div v-if="loading" class="card-body text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2 text-muted">{{ t('admin.addressBook.loading') }}</p>
      </div>
      <div v-else class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>{{ t('admin.addressBook.client') }}</th>
                <th>{{ t('admin.addressBook.phone') }}</th>
                <th>{{ t('admin.addressBook.email') }}</th>
                <th>{{ t('admin.addressBook.location') }}</th>
                <th class="text-center">{{ t('admin.addressBook.addressesCount') }}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="clients.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="bi bi-journal-bookmark fs-1 d-block mb-2"></i>
                  {{ t('admin.addressBook.noClients') }}
                </td>
              </tr>
              <tr v-for="c in clients" :key="c.uuid">
                <td>
                  <div class="fw-medium">{{ c.firstname }} {{ c.lastname }}</div>
                </td>
                <td>
                  <a v-if="c.phone" :href="`tel:${c.phone}`" class="small">{{ c.phone }}</a>
                  <span v-else class="text-muted small">—</span>
                </td>
                <td><span class="small">{{ c.email || '—' }}</span></td>
                <td class="small">{{ locationLabel(c) }}</td>
                <td class="text-center">
                  <span class="badge bg-secondary-subtle text-secondary">{{ c.addresses?.length ?? 0 }}</span>
                </td>
                <td class="text-end">
                  <NuxtLink :to="`/admin/users/${c.uuid}`" class="btn btn-sm btn-outline-primary">
                    {{ t('admin.addressBook.viewProfile') }}
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer bg-transparent py-3">
        <AdminPagination
          v-model:current-page="currentPage"
          v-model:limit="perPage"
          :total-items="total"
          @update:current-page="(p: number) => goToPage(p)"
          @update:limit="(l: number) => goToPage(1, l)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

import { ref, reactive, computed, onMounted } from 'vue'
import { useAddressBookStore, type DirectoryClient } from '~/stores/addressBook'

definePageMeta({ layout: 'admin' })

const addressBookStore = useAddressBookStore()

const currentPage = ref(1)
const perPage = ref(15)
const loading = computed(() => addressBookStore.directoryLoading)
const clients = computed(() => addressBookStore.directory)
const total = computed(() => addressBookStore.directoryMeta.total)

const filters = reactive({ search: '' })

function locationLabel(c: DirectoryClient) {
  const latest = c.addresses?.[0]
  const city = latest?.city || c.city
  const country = latest?.country || c.country
  return [city, country].filter(Boolean).join(', ') || '—'
}

async function load() {
  await addressBookStore.fetchDirectory({
    page: currentPage.value,
    limit: perPage.value,
    search: filters.search.trim() || undefined,
  })
}

function goToPage(p: number, l?: number) {
  if (typeof l === 'number') perPage.value = l
  currentPage.value = p
  load()
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null
function debouncedFetch() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => goToPage(1), 400)
}

function clearSearch() {
  filters.search = ''
  goToPage(1)
}

onMounted(load)
</script>

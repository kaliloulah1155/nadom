<template>
  <div>
    <div class="mb-4">
      <h4 class="mb-1">{{ t('admin.personalShoppingHub.title') }}</h4>
      <p class="text-muted mb-0">
        {{ t('admin.personalShoppingHub.subtitle') }}
      </p>
    </div>

    <div class="row g-3">
      <div v-can="['list', 'personal-shopping-requests']" class="col-md-6 col-xl-4">
        <NuxtLink to="/admin/requests" class="text-decoration-none">
          <div class="card border-0 shadow-sm h-100 hover-lift">
            <div class="card-body">
              <div class="d-flex align-items-center gap-3 mb-2">
                <span class="rounded-circle bg-primary bg-opacity-10 p-3 text-primary">
                  <i class="bi bi-bag-check fs-4"></i>
                </span>
                <div>
                  <h5 class="mb-0 text-dark">{{ t('admin.personalShoppingHub.requests') }}</h5>
                  <small class="text-muted">{{ t('admin.personalShoppingHub.trackPs') }}</small>
                </div>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div v-can="['list', 'categories']" class="col-md-6 col-xl-4">
        <NuxtLink to="/admin/categories" class="text-decoration-none">
          <div class="card border-0 shadow-sm h-100 hover-lift">
            <div class="card-body">
              <div class="d-flex align-items-center gap-3 mb-2">
                <span class="rounded-circle bg-primary bg-opacity-10 p-3 text-primary">
                  <i class="bi bi-tags fs-4"></i>
                </span>
                <div>
                  <h5 class="mb-0 text-dark">{{ t('admin.personalShoppingHub.categories') }}</h5>
                  <small class="text-muted">{{ t('admin.personalShoppingHub.catalogLines') }}</small>
                </div>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div class="col-md-6 col-xl-4">
        <NuxtLink to="/admin/products" class="text-decoration-none">
          <div class="card border-0 shadow-sm h-100 hover-lift">
            <div class="card-body">
              <div class="d-flex align-items-center gap-3 mb-2">
                <span class="rounded-circle bg-primary bg-opacity-10 p-3 text-primary">
                  <i class="bi bi-grid-3x3-gap fs-4"></i>
                </span>
                <div>
                  <h5 class="mb-0 text-dark">{{ t('admin.personalShoppingHub.products') }}</h5>
                  <small class="text-muted">{{ t('admin.personalShoppingHub.productSheets') }}</small>
                </div>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div class="col-md-6 col-xl-4">
        <NuxtLink to="/personal-shopping" target="_blank" class="text-decoration-none">
          <div class="card border-0 shadow-sm h-100 hover-lift">
            <div class="card-body">
              <div class="d-flex align-items-center gap-3 mb-2">
                <span class="rounded-circle bg-secondary bg-opacity-10 p-3 text-secondary">
                  <i class="bi bi-box-arrow-up-right fs-4"></i>
                </span>
                <div>
                  <h5 class="mb-0 text-dark">{{ t('admin.personalShoppingHub.storefront') }} <i class="bi bi-box-arrow-up-right small"></i></h5>
                  <small class="text-muted">{{ t('admin.personalShoppingHub.clientPreview') }}</small>
                </div>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'admin',
})
</script>

<style scoped>
.hover-lift {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important;
}
</style>

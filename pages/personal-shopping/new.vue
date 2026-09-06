<template>
  <div class="page-wrapper">
    <!-- Bandeau d'accueil. Dans l'espace client, le layout `client` le rend
         compact : il occuperait sinon toute la colonne de contenu. -->
    <section class="page-hero">
      <div class="container">
        <div class="row justify-content-center">
          <h1 class="fw-bold text-white text-center">{{ t('personalShopping.newRequest') }}</h1>
          <p class="opacity-75 text-white text-center">{{ t('personalShopping.newRequestSubtitle') }}</p>
        </div>
      </div>
    </section>
    <div class="container py-5 mt-2">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card border-0 shadow-lg">
            <div class="card-body p-4 p-lg-5">
              <!-- Tout le formulaire vit dans ce composant, partagé avec la modale
                   "Nouvelle demande" du back-office (pages/admin/requests/index.vue). -->
              <PersonalShoppingForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PersonalShoppingForm from '~/components/personalShopping/PersonalShoppingForm.vue'

definePageMeta({
  layout: 'client',
  // Les utilisateurs back-office sont renvoyés vers leur équivalent admin.
})

const { t } = useI18n()
</script>

<style scoped>
.page-wrapper {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.page-hero {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  margin-bottom: -50px;
  padding-bottom: 80px;
}
</style>

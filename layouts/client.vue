<template>
  <!-- Reprend l'habillage public (entête, pied de page) et y ajoute la barre
       latérale de l'espace client, pour qu'elle reste visible d'une page à
       l'autre : nouvelle demande, suivi de colis, guide, visa…

       La barre n'apparaît que pour un client connecté : ces pages restent
       ouvertes aux visiteurs, à qui une barre contenant « Déconnexion » n'aurait
       aucun sens. Les utilisateurs back-office, eux, n'ont pas à se trouver ici
       (middleware global `clientOnly.global.ts`). -->
  <NuxtLayout name="default">
    <div v-if="showSidebar" class="client-area py-4 py-lg-5">
      <div class="container">
        <div class="row g-4">
          <div class="col-lg-3">
            <ClientSidebar />
          </div>
          <div class="col-lg-9">
            <slot />
          </div>
        </div>
      </div>
    </div>
    <slot v-else />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ClientSidebar from '~/components/ClientSidebar.vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const showSidebar = computed(
  () => authStore.isAuthenticated && !authStore.hasBackofficeAccess,
)
</script>

<style scoped>
.client-area {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

/* Les pages de l'espace client sont aussi des pages publiques : elles portent un
   bandeau d'accueil pleine largeur, très haut, qui écrase la colonne de contenu
   une fois la barre latérale affichée. On l'y rend compact — sans le supprimer,
   pour garder le repère visuel — et on neutralise les enveloppes de pleine page
   que ces pages appliquent (fond, hauteur minimale, conteneur, marges). */
.client-area :deep(.page-wrapper) {
  background: none;
  min-height: 0;
}

/* Chaque page a sa propre classe de bandeau (`page-hero`, `guide-hero`,
   `visa-hero`, `tracking-hero`…). Le sélecteur les couvre toutes, y compris
   celles des pages ajoutées plus tard. */
.client-area :deep([class*='-hero']) {
  margin-bottom: 1.5rem !important;
  padding: 1.5rem !important;
  min-height: 0 !important;
  border-radius: 14px;
}

.client-area :deep([class*='-hero'] h1) {
  font-size: 1.6rem;
  margin-bottom: 0.25rem;
}

.client-area :deep([class*='-hero'] h2) {
  font-size: 1.4rem;
}

.client-area :deep([class*='-hero'] p) {
  font-size: 0.95rem;
  margin-bottom: 0;
}

/* Les motifs décoratifs de fond n'apportent rien à cette échelle. */
.client-area :deep(.hero-pattern) {
  display: none;
}

/* Certaines pages font remonter une carte sur le bandeau (`margin-top: -60px`).
   Le bandeau étant désormais compact, cette carte recouvrait le sous-titre et le
   rendait illisible : on réserve la place sous le texte. */
.client-area :deep([class*='-hero']) {
  padding-bottom: 4.5rem !important;
}

/* Les conteneurs internes des pages ne doivent plus recentrer ni rajouter de
   gouttières : la colonne le fait déjà. */
.client-area :deep(.page-hero .container),
.client-area :deep(.page-wrapper > .container) {
  max-width: 100%;
  padding-left: 0;
  padding-right: 0;
}

.client-area :deep(.page-wrapper > .container) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  margin-top: 0 !important;
}

/* La carte du formulaire occupe toute la colonne au lieu d'être bridée à col-lg-8. */
.client-area :deep(.page-wrapper > .container > .row > [class*='col-']) {
  flex: 0 0 100%;
  max-width: 100%;
}
</style>

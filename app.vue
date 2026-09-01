<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Ancre chaque page sur le domaine de production, quel que soit l'hote reel
// (nadom.co ou rc.nadom.co partagent le meme build) : consolide les signaux
// SEO sur une seule URL canonique plutot que de laisser Google arbitrer entre
// deux domaines a contenu identique.
const route = useRoute()
const canonicalUrl = computed(() => `https://nadom.co${route.path}`)

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
})
</script>


<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="py-5 text-center">
      <div class="spinner-border text-primary"></div>
    </div>

    <!-- Not Found -->
    <div v-else-if="!post" class="py-5">
      <div class="container text-center">
        <i class="bi bi-journal-x display-1 text-muted"></i>
        <h3 class="mt-4">Article non trouve</h3>
        <p class="text-muted">Cet article n'existe pas ou a ete supprime.</p>
        <NuxtLink to="/resources/blog" class="btn btn-primary">
          <i class="bi bi-arrow-left me-2"></i>Retour au blog
        </NuxtLink>
      </div>
    </div>

    <!-- Article -->
    <template v-else>
      <!-- Hero -->
      <section class="blog-hero position-relative">
        <div class="hero-bg" :style="{ backgroundImage: `url(${post.image})` }"></div>
        <div class="container position-relative py-5">
          <div class="row justify-content-center">
            <div class="col-lg-8 text-center text-white">
              <div class="mb-3">
                <span class="badge bg-primary me-2">{{ post.category }}</span>
                <span class="opacity-75">{{ post.readTime }} min de lecture</span>
              </div>
              <h1 class="display-5 fw-bold mb-4">{{ post.title }}</h1>
              <div class="d-flex justify-content-center align-items-center gap-4">
                <div class="d-flex align-items-center">
                  <img :src="post.authorAvatar" class="rounded-circle me-2" width="40" height="40" :alt="post.author" />
                  <span>{{ post.author }}</span>
                </div>
                <div>
                  <i class="bi bi-calendar3 me-1"></i>
                  {{ formatDate(post.publishedAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Content -->
      <section class="py-5">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-lg-8">
              <!-- Featured Image -->
              <div class="mb-5">
                <img :src="post.image" :alt="post.title" class="img-fluid rounded-4 shadow w-100" />
              </div>

              <!-- Article Content -->
              <article class="blog-content">
                <p class="lead text-muted">{{ post.excerpt }}</p>

                <hr class="my-4">

                <!-- Example Content -->
                <h2>Introduction</h2>
                <p>
                  L'import-export avec la Chine represente une opportunite majeure pour les entrepreneurs africains.
                  Avec des millions de produits disponibles a des prix competitifs, la Chine reste le premier fournisseur
                  mondial de marchandises diverses.
                </p>

                <p>
                  Dans cet article, nous allons explorer les differentes etapes pour reussir vos operations d'import-export,
                  les pieges a eviter, et les bonnes pratiques pour optimiser vos couts.
                </p>

                <h2>Les avantages de l'import depuis la Chine</h2>
                <ul>
                  <li><strong>Prix competitifs :</strong> Les couts de production en Chine permettent d'obtenir des marges interessantes.</li>
                  <li><strong>Large choix :</strong> Des millions de produits sont disponibles dans toutes les categories.</li>
                  <li><strong>Capacite de production :</strong> Les usines chinoises peuvent gerer des commandes de toutes tailles.</li>
                  <li><strong>Innovation :</strong> La Chine est a la pointe dans de nombreux secteurs technologiques.</li>
                </ul>

                <blockquote class="blockquote bg-light p-4 rounded my-4">
                  <p class="mb-0 fst-italic">
                    "La cle du succes dans l'import-export, c'est d'avoir un partenaire de confiance sur place
                    qui comprend les realites locales."
                  </p>
                  <footer class="blockquote-footer mt-2">Expert NADOM</footer>
                </blockquote>

                <h2>Les etapes cles pour importer</h2>
                <ol>
                  <li class="mb-3">
                    <strong>Identifier le produit :</strong> Definissez precisement ce que vous souhaitez importer.
                  </li>
                  <li class="mb-3">
                    <strong>Trouver le fournisseur :</strong> Utilisez nos services de Personal Shopping pour identifier
                    les meilleurs fournisseurs.
                  </li>
                  <li class="mb-3">
                    <strong>Negocier les termes :</strong> Prix, quantites minimales, delais de production.
                  </li>
                  <li class="mb-3">
                    <strong>Controle qualite :</strong> Faites inspecter les produits avant expedition.
                  </li>
                  <li class="mb-3">
                    <strong>Expedition :</strong> Choisissez le mode de transport adapte a vos besoins.
                  </li>
                </ol>

                <div class="alert alert-primary my-4">
                  <i class="bi bi-lightbulb me-2"></i>
                  <strong>Conseil :</strong> Commencez par des petites quantites pour tester le marche et la qualite
                  avant de passer des commandes plus importantes.
                </div>

                <h2>Conclusion</h2>
                <p>
                  L'import-export avec la Chine peut etre tres rentable si vous suivez les bonnes pratiques.
                  N'hesitez pas a vous faire accompagner par des professionnels pour securiser vos operations.
                </p>

                <p>
                  Chez NADOM, nous vous accompagnons a chaque etape de votre projet, de la recherche de produits
                  jusqu'a la livraison a votre porte.
                </p>
              </article>

              <!-- Tags -->
              <div class="mt-5 pt-4 border-top">
                <h6 class="mb-3">Tags</h6>
                <div class="d-flex flex-wrap gap-2">
                  <span v-for="tag in post.tags" :key="tag" class="badge bg-light text-dark">
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- Share -->
              <div class="mt-4 pt-4 border-top">
                <h6 class="mb-3">Partager cet article</h6>
                <div class="d-flex gap-2">
                  <a href="#" class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-facebook"></i>
                  </a>
                  <a href="#" class="btn btn-outline-info btn-sm">
                    <i class="bi bi-twitter"></i>
                  </a>
                  <a href="#" class="btn btn-outline-success btn-sm">
                    <i class="bi bi-whatsapp"></i>
                  </a>
                  <a href="#" class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-linkedin"></i>
                  </a>
                </div>
              </div>

              <!-- CTA -->
              <div class="card bg-primary text-white mt-5">
                <div class="card-body p-4 p-lg-5 text-center">
                  <h4 class="fw-bold mb-3">Pret a commencer votre projet d'import ?</h4>
                  <p class="opacity-75 mb-4">
                    Contactez-nous pour discuter de votre projet et obtenir un devis personnalise.
                  </p>
                  <div class="d-flex justify-content-center gap-3 flex-wrap">
                    <NuxtLink to="/personal-shopping/new" class="btn btn-light">
                      Nouvelle demande
                    </NuxtLink>
                    <a :href="`https://wa.me/${useRuntimeConfig().public.whatsapp}`" target="_blank" class="btn btn-outline-light">
                      <i class="bi bi-whatsapp me-2"></i>Nous contacter
                    </a>
                  </div>
                </div>
              </div>

              <!-- Navigation -->
              <div class="d-flex justify-content-between mt-5 pt-4 border-top">
                <NuxtLink to="/resources/blog" class="btn btn-outline-secondary">
                  <i class="bi bi-arrow-left me-2"></i>Retour au blog
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBlogStore } from '~/stores/blog'
import { useFormatters } from '~/composables/useFormatters'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const blogStore = useBlogStore()
const { formatDate } = useFormatters()

const loading = ref(true)
const post = ref<any>(null)

onMounted(async () => {
  await blogStore.fetchPosts()
  const slug = route.params.slug as string
  post.value = blogStore.getPostBySlug(slug)
  loading.value = false
})
</script>

<style scoped>
.blog-hero {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  min-height: 400px;
  display: flex;
  align-items: center;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.2;
}

.blog-content {
  font-size: 1.1rem;
  line-height: 1.8;
}

.blog-content h2 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.blog-content ul,
.blog-content ol {
  margin-bottom: 1.5rem;
}

.blog-content li {
  margin-bottom: 0.5rem;
}

.blog-content p {
  margin-bottom: 1.5rem;
}
</style>

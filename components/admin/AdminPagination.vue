<template>
  <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
    <!-- Per Page Selector -->
    <div class="d-flex align-items-center gap-2">
      <span class="text-muted small">Afficher</span>
      <select 
        :value="limit" 
        class="form-select input-md" 
        style="width: 80px;"
        @change="$emit('update:limit', Number(($event.target as HTMLSelectElement).value))"
      >
        <option v-for="opt in limitOptions" :key="opt" :value="opt">{{ opt }}</option>
      </select>
      <span class="text-muted small">par page</span>
    </div>

    <!-- Navigation -->
    <nav v-if="totalPages > 1">
      <ul class="pagination justify-content-center mb-0">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="$emit('update:currentPage', currentPage - 1)">
            <i class="bi bi-chevron-left"></i>
          </button>
        </li>
        
        <li
          v-for="page in visiblePages"
          :key="page"
          class="page-item"
          :class="{ active: currentPage === page, disabled: page === -1 }"
        >
          <button 
            v-if="page !== -1" 
            class="page-link" 
            @click="$emit('update:currentPage', page)"
          >
            {{ page }}
          </button>
          <span v-else class="page-link border-0 bg-transparent">...</span>
        </li>

        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="$emit('update:currentPage', currentPage + 1)">
            <i class="bi bi-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Info -->
    <div class="text-muted small">
      Affichage de {{ startItem }} à {{ endItem }} sur {{ totalItems }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  totalItems: number
  currentPage: number
  limit: number
  limitOptions?: number[]
}>()

const emit = defineEmits(['update:currentPage', 'update:limit'])

const limitOptions = props.limitOptions || [5, 10, 20, 50]

const totalPages = computed(() => Math.ceil(props.totalItems / props.limit))
const startItem = computed(() => props.totalItems === 0 ? 0 : (props.currentPage - 1) * props.limit + 1)
const endItem = computed(() => Math.min(props.currentPage * props.limit, props.totalItems))

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  
  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) pages.push(i)
  } else {
    pages.push(1)
    if (props.currentPage > 3) pages.push(-1)
    
    const start = Math.max(2, props.currentPage - 1)
    const end = Math.min(totalPages.value - 1, props.currentPage + 1)
    
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i)
    }
    
    if (props.currentPage < totalPages.value - 2) pages.push(-1)
    if (!pages.includes(totalPages.value)) pages.push(totalPages.value)
  }
  
  return pages
})
</script>

<style scoped>
.page-link {
  cursor: pointer;
  min-width: 35px;
  text-align: center;
}
.page-item.active .page-link {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}
</style>

<template>
  <div class="nadom-marquee" :style="{ background, color }">
    <div class="nadom-marquee__track" :style="{ animationDuration: duration + 's' }">
      <span class="nadom-marquee__chunk">{{ text }}</span>
      <span class="nadom-marquee__chunk" aria-hidden="true">{{ text }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    text: string
    duration?: number
    background?: string
    color?: string
  }>(),
  {
    duration: 30,
    background: 'linear-gradient(90deg, #1e293b 0%, #334155 100%)',
    color: '#ffffff',
  },
)
</script>

<style scoped>
.nadom-marquee {
  overflow: hidden;
  white-space: nowrap;
  padding: 0.6rem 0;
  font-weight: 500;
  font-size: 0.95rem;
  position: relative;
}

.nadom-marquee__track {
  display: inline-flex;
  gap: 3rem;
  padding-left: 100%;
  animation: nadom-marquee-scroll linear infinite;
}

.nadom-marquee__chunk {
  display: inline-block;
  padding-right: 3rem;
}

@keyframes nadom-marquee-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}

.nadom-marquee:hover .nadom-marquee__track {
  animation-play-state: paused;
}
</style>

<template>
  <!-- Layout auth : pas de header / nav / footer du site -->
  <div class="auth-layout">
    <slot />
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
}
</style>

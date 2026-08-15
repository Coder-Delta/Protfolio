<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'page-slide'" mode="out-in">
      <component :is="Component" :key="route.fullPath" />
    </transition>
  </router-view>
  <PrivacyNotice />
</template>

<script setup>
import PrivacyNotice from '@/components/PrivacyNotice.vue';
</script>

<style scoped>
.page-slide-enter-active,
.page-slide-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.page-slide-enter-from {
  opacity: 0;
  transform: translateY(18px);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translateY(-18px);
}
</style>
